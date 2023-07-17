import Arweave from 'arweave';
import { SarcoNetworkConfig } from '../types';
import { ApiConfig } from 'arweave/node/lib/api';
import { ArweaveResponse, OnDownloadProgress } from '../types/arweave';

let arweave: Arweave;

function getArweave(arweaveConfig: ApiConfig) {
  if (arweave === undefined) {
    arweave = Arweave.init(arweaveConfig);
  }

  return arweave;
}

const arweaveNotReadyMsg = 'Arweave instance not ready!';
export const arweaveDataDelimiter = Buffer.from('|', 'binary');

async function customGetTx(id: string, onDownloadProgress: OnDownloadProgress): Promise<any> {
  if (!arweave) {
    console.error(arweaveNotReadyMsg);
    throw Error(arweaveNotReadyMsg);
  }

  const response = await arweave.api.get(`tx/${id}`, {
    onDownloadProgress: e => {
      const progress = Math.trunc(e.loaded / e.total);
      onDownloadProgress(progress);
    },
  });

  if (response.status == 200) {
    const dataSize = parseInt(response.data.data_size);

    if (response.data.format >= 2 && dataSize > 0 && dataSize <= 1024 * 1024 * 12) {
      const data = await arweave.transactions.getData(id);
      return {
        ...response.data,
        data,
      };
    }

    return {
      ...response.data,
      format: response.data.format || 1,
    };
  }
  if (response.status == 404) {
    throw Error('TX_NOT_FOUND' /* ArweaveErrorType.TX_NOT_FOUND */);
  }
  if (response.status == 410) {
    throw Error('TX_FAILED' /* ArweaveErrorType.TX_FAILED */);
  }
  throw Error('TX_INVALID' /* ArweaveErrorType.TX_INVALID */);
}

function splitPackedDataBuffer(concatenatedBuffer: Buffer): ArweaveResponse {
  // Concatenated buffer is formatted as:
  // <meta_buffer_length>
  //   <delimiter>
  // <keyshare_buffer_length>
  //   <delimiter>
  // <metatadata>
  // <keyshares>
  // <payload>

  concatenatedBuffer = Buffer.from(concatenatedBuffer);

  // Delimiter after metatdata length
  const firstDelimiterIndex = concatenatedBuffer.indexOf(arweaveDataDelimiter);
  const metadataLength = Number.parseInt(concatenatedBuffer.slice(0, firstDelimiterIndex).toString('binary'));

  // Delimiter after keyshare length
  const secondDelimiterIndex = concatenatedBuffer.indexOf(arweaveDataDelimiter, firstDelimiterIndex + 1);
  const keyshareLength = Number.parseInt(
    concatenatedBuffer.slice(firstDelimiterIndex + 1, secondDelimiterIndex).toString('binary')
  );

  // metadata
  const metadataStr = concatenatedBuffer
    .slice(secondDelimiterIndex + 1, secondDelimiterIndex + 1 + metadataLength)
    .toString('binary');

  const metadata = JSON.parse(metadataStr);

  // keyshares
  const sharesBuffer = concatenatedBuffer
    .slice(secondDelimiterIndex + metadataLength + 1, secondDelimiterIndex + 1 + metadataLength + keyshareLength)
    .toString('binary');

  const keyShares = JSON.parse(sharesBuffer.toString().trim());

  // payload
  const fileBuffer = concatenatedBuffer.slice(secondDelimiterIndex + 1 + metadataLength + keyshareLength);

  return { metadata, keyShares, fileBuffer };
}

export async function fetchArweaveFile(
  arweaveTxId: string,
  networkConfig: SarcoNetworkConfig,
  onDownloadProgress: OnDownloadProgress
): Promise<ArweaveResponse> {
  const arweave = getArweave(networkConfig.arweaveConfig);

  try {
    // const tx = await arweave.transactions.get(arweaveTxId);
    const tx = await customGetTx(arweaveTxId, onDownloadProgress);

    const { metadata, keyShares, fileBuffer } = splitPackedDataBuffer(tx.data as Buffer);

    return { metadata, keyShares, fileBuffer };
  } catch (error) {
    throw new Error(`Error fetching arweave file: ${error}`);
  }
}

/**
 * Returns base64 data of a given File object
 * @param file The File object
 * @returns Object with params:
 *
 *  - `type` - file type descriptor string formatted as `"data:<file-type>/<file-ext>;base64"`
 *
 *  - `data` - file data formatted as a base64 string
 */
export function readFileDataAsBase64(file: File): Promise<{ type: string; data: Buffer }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      // format of `res` is:
      // "data:image/png;base64,iVBORw0KGg..."
      const res = event.target?.result as string;
      if (!res.startsWith('data:')) {
        reject('There was a problem reading the file');
      }

      const i = res.indexOf(',');

      resolve({
        type: res.slice(0, i),
        data: Buffer.from(res.slice(i + 1), 'base64'),
      });
    };

    reader.onerror = err => {
      reject(err);
    };

    reader.readAsDataURL(file);
  });
}
