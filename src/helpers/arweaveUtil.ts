import Arweave from 'arweave';
import { SarcoNetworkConfig } from '../types';
import { ArweaveResponse, OnDownloadProgress } from '../types/arweave';

export const arweaveDataDelimiter = Buffer.from('|', 'binary');

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
  onDownloadProgress: OnDownloadProgress,
  arweave: Arweave
): Promise<ArweaveResponse> {
  // @ts-ignore
  const arweaveClient = arweave.init(networkConfig.arweaveConfig);

  try {
    const res = await arweaveClient.api.get(`/${arweaveTxId}`, {
      responseType: 'arraybuffer',
      onDownloadProgress,
    });

    const { metadata, keyShares, fileBuffer } = splitPackedDataBuffer(res.data as Buffer);

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
