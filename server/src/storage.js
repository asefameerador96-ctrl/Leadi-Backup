import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const containerName = process.env.AZURE_STORAGE_CONTAINER || "app-content";

let containerClient;

function buildClientFromConnectionString() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return null;
  }

  const serviceClient = BlobServiceClient.fromConnectionString(connectionString);
  return serviceClient.getContainerClient(containerName);
}

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

  const client = buildClientFromManagedIdentity() || buildClientFromConnectionString();
  if (!client) {
    throw new Error("Azure Blob configuration missing. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME.");
  }

  await client.createIfNotExists({ access: "blob" });
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
