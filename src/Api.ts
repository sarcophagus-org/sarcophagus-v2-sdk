import { EmbalmerFacet__factory, SarcoTokenMock__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumberish, Signature, Signer, ethers } from 'ethers';

// Temporary
// TODO: Get this from the contracts package
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';
const goerliSarcoTokenAddress = '0x4633b43990b41B57b3678c6F3Ac35bA75C3D8436';

/**
 * Options for contract method calls
 */
export interface MethodCallOptions {
    /** If set to false, the contract method will be called using callStatic first to check if the transaction will succeed */
    ignoreSafeCall?: boolean;

    /** Callback function that will be called if the transaction succeeds */
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

        /** 
         * Re-wraps a sarcophagus so it should be resurrected at a new resurrection time
         * 
         * @param sarcoId - The ID of the sarcophagus to be rewrapped
         * @param newResurrectionTimestampSeconds - The new resurrection timestamp in seconds
         * @param options - Options for the contract method call
         * @returns The transaction response
         * */
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

        /**
         * Deactivates a sarcohpagus so it can no longer be resurrected
         * 
         * @param sarcoId - The ID of the sarcophagus to be deactivated
         * @param options - Options for the contract method call
         * @returns The transaction response
         */
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

        /** 
         * Cleans a sarcophagus that failed to be unwrapped. This can only be called by the sarcophagus owner
         * within a certain time period after the resurrection time has passed. Otherwise it can only be called 
         * by the Sarcophagus DAO.
         * 
         * @param sarcoId - The ID of the sarcophagus to be cleaned
         * @param options - Options for the contract method call
         * @returns The transaction response
         * */
        async cleanSarcophagus(
            sarcoId: string,
            options?: MethodCallOptions
        ): Promise<ethers.providers.TransactionResponse> {
            return this._methodCall({
                contract: new ethers.Contract(
                    goerliDiamondAddress,
                    EmbalmerFacet__factory.abi,
                    this.signer
                ),
                methodName: 'cleanSarcophagus',
                inputArgs: [sarcoId],
                options
            });
        }

        /**
         * Accuse a sarcophagus' archaeologists of leaking the sarcophagus' private keys
         * 
         * @param sarcoId - The ID of the sarcophagus to be accused
         * @param publicKeys - The public keys of the archaeologists to be accused
         * @param signatures - The signatures of the archaeologists to be accused. Generated
         * @param paymentAddress - The address to send the payment to if the accusal is successful
         * @param options - Options for the contract method call
         * @returns The transaction response
         */
        async accuseSarcophagus(
            sarcoId: string, publicKeys: string[],
            signatures: Signature[],
            paymentAddress: string | undefined,
            options?: MethodCallOptions
        ): Promise<ethers.providers.TransactionResponse> {
            const signaturesVrs = signatures.map(sig => ({ v: sig.v, r: sig.r, s: sig.s }));
            return this._methodCall({
                contract: new ethers.Contract(
                    goerliDiamondAddress,
                    EmbalmerFacet__factory.abi,
                    this.signer
                ),
                methodName: 'accuseSarcophagus',
                inputArgs: [sarcoId, publicKeys, signaturesVrs, paymentAddress],
                options
            });
        }

        /**
         * Approve the sarcophagus contracts to spend the specified amount of SARCO tokens 
         *
         * @param amount - The amount of SARCO tokens to approve
         * @param options - Options for the contract method call
         * @returns The transaction response
         * */
        async approveSarcophagus(amount: BigNumberish, options?: MethodCallOptions): Promise<ethers.providers.TransactionResponse> {
            return this._methodCall({
                contract: new ethers.Contract(
                    goerliSarcoTokenAddress,
                    SarcoTokenMock__factory.abi,
                    this.signer
                ),
                methodName: 'approve',
                inputArgs: [goerliDiamondAddress, amount],
                options
            });
        }
    };
} 