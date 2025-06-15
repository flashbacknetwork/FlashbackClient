/**
 * Generate a 64 bytes base64 block ID string.
 *
 * @export
 * @param {number} blockIndex
 * @returns {string}
 */
export function generateBlockID(blockIDPrefix: string, blockIndex: number): string {
  // To generate a 64 bytes base64 string, source string should be 48
  const maxSourceStringLength = 48;

  // A blob can have a maximum of 100,000 uncommitted blocks at any given time
  const maxBlockIndexLength = 6;

  const maxAllowedBlockIDPrefixLength = maxSourceStringLength - maxBlockIndexLength;

  if (blockIDPrefix.length > maxAllowedBlockIDPrefixLength) {
    blockIDPrefix = blockIDPrefix.slice(0, maxAllowedBlockIDPrefixLength);
  }
  const res =
    blockIDPrefix +
    blockIndex.toString().padStart(maxSourceStringLength - blockIDPrefix.length, '0');
  return Buffer.from(res).toString('base64');
}
