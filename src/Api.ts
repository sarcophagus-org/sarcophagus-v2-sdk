import { EmbalmerFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { Signer, ethers } from 'ethers';

// Temporary
// TODO: Get this from the contracts package
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';

export interface MethodCallOptions {
    ignoreSafeCall?: boolean;
    onTxSuccess?: Function;
}

export interface CreateSarcophagusOptions {
    ignoreSafeCall?: boolean;
}

export function Api<T extends new (...args: any[]) => {}>(Base: T) {
    return class extends Base {
        signer: Signer;

        constructor(...args: any[]) {
            super(...args);
            this.signer = args[0]; // Assuming the signer is the first argument
        }

        async _methodCall(args: {
            contract: ethers.Contract,
            methodName: string,
            inputArgs: any[],
            options?: MethodCallOptions
        }): Promise<ethers.providers.TransactionResponse> {
            const { methodName, inputArgs, options, contract } = args;
            const useSafeCall = options?.ignoreSafeCall ?? true;

            if (useSafeCall) {
                try {
                    // Check if the transaction will succeed using callStatic
                    await contract.callStatic[methodName](...inputArgs);

                    // Proceed with the actual transaction if callStatic succeeds
                    const transactionResponse: ethers.ContractTransaction = await contract[methodName](...inputArgs);
                    transactionResponse.wait().then((reciept) => {
                        if (options?.onTxSuccess) {
                            options.onTxSuccess(reciept);
                        }
                    });
                    return transactionResponse;
                } catch (err) {
                    const error = err as Error;
                    console.error(`Error during the safe contract call: ${error.message}`);
                    throw error;
                }
            } else {
                // If useSafeCall is set to false, directly call the contract method
                const transactionResponse = await contract[methodName](...inputArgs);
                return transactionResponse;
            }
        }

        async createSarcophagus(
            sarcoId: string,
            name: string,
            maximumRewrapInterval: number,
            maximumResurrectionTime: number,
            recipientAddress: string,
            resurrectionTime: number,
            threshold: number,
            creationTime: number,
            selectedArchaeologists: {
                publicKey: Uint8Array;
                archAddress: string;
                diggingFeePerSecond: number;
                curseFee: number;
                v: number;
                r: string;
                s: string;
            }[],
            arweaveTxId: string,
            options: CreateSarcophagusOptions = {}
        ): Promise<ethers.providers.TransactionResponse> {
            return this._methodCall({
                contract: new ethers.Contract(
                    goerliDiamondAddress,
                    EmbalmerFacet__factory.abi,
                    this.signer
                ),
                methodName: 'createSarcophagus',
                inputArgs: [
                    sarcoId,
                    {
                        name,
                        maximumRewrapInterval,
                        maximumResurrectionTime,
                        recipientAddress,
                        resurrectionTime,
                        threshold,
                        creationTime,
                    },
                    selectedArchaeologists,
                    arweaveTxId,
                ],
                options
            });
        }

        async rewrapSarcophagus(
            sarcoId: string,
            newResurrectionTimestampSeconds: number,
            options?: MethodCallOptions
        ): Promise<ethers.providers.TransactionResponse> {
            return this._methodCall({
                contract: new ethers.Contract(
                    goerliDiamondAddress,
                    EmbalmerFacet__factory.abi,
                    this.signer
                ),
                methodName: 'rewrapSarcophagus',
                inputArgs: [
                    sarcoId,
                    newResurrectionTimestampSeconds
                ],
                options
            });
        }

        async burySarcophagus(
            sarcoId: string,
            options?: MethodCallOptions
        ): Promise<ethers.providers.TransactionResponse> {
            return this._methodCall({
                contract: new ethers.Contract(
                    goerliDiamondAddress,
                    EmbalmerFacet__factory.abi,
                    this.signer
                ),
                methodName: 'burySarcophagus',
                inputArgs: [sarcoId],
                options
            });
        }
    };
} 