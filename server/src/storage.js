import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const containerName = process.env.AZURE_STORAGE_CONTAINER || "app-content";

let containerClient;

function buildClientFromManagedIdentity() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) {
    return null;
  }

  const accountUrl = `https://${accountName}.blob.core.windows.net`;
  const serviceClient = new BlobServiceClient(accountUrl, new DefaultAzureCredential());
  return serviceClient.getContainerClient(containerName);
}

export async function getContainerClient() {
  if (containerClient) {
    return containerClient;
  }

  const client = buildClientFromManagedIdentity();
  if (!client) {
    throw new Error("Azure Blob configuration missing. Set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_CONTAINER.");
  }

  const exists = await client.exists();
  if (!exists) {
    throw new Error(`Azure Blob container '${containerName}' does not exist.`);
  }

  containerClient = client;
  return containerClient;
}

export async function uploadToBlob({ buffer, originalName, mimeType }) {
  const client = await getContainerClient();
  const safeBaseName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blobName = `${Date.now()}-${safeBaseName}`;
  const blockBlobClient = client.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType || "application/octet-stream",
    },
  });

  return {
    blobName,
    url: blockBlobClient.url,
    container: client.containerName,
  };
}
