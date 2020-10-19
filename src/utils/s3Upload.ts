import aws from 'aws-sdk';

let defaultClient: aws.S3;

interface S3Properties {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export function setDefaultClient(client: aws.S3) {
  defaultClient = client;
}

export function makeS3Client({ accessKeyId, secretAccessKey, bucket }: S3Properties, notDefault?: boolean) {
  const client = new aws.S3({
    accessKeyId,
    secretAccessKey,
    params: { Bucket: bucket },
  });

  if (!defaultClient && !notDefault) {
    defaultClient = client;
  }

  return client;
}

export async function uploadToS3(file: any, key?: string, client?: aws.S3) {
  let clientToUse = client;
  if (!clientToUse) {
    clientToUse = defaultClient;
  }

  if (!clientToUse) {
    throw new Error('No S3 client initialized');
  }

  const { createReadStream, filename, mimetype } = file;
  const data = await readData(createReadStream);

  const response = await clientToUse
    .upload({
      Key: key || filename,
      ACL: 'public-read',
      Body: data,
      ContentType: mimetype,
      Bucket: clientToUse.config.params?.Bucket,
    })
    .promise();

  return {
    name: filename,
    mimetype,
    path: response.Key,
    url: response.Location,
    location: 'S3',
  };
}

function readData(createSteam: any, encoding: string = 'utf-8'): Promise<any> {
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    createSteam()
      .on('error', reject)
      .on('data', (chunk: any) => {
        data.push(chunk);
      })

      //@ts-ignore
      .on('finish', () => resolve(Buffer.concat(data)))

      //@ts-ignore
      .on('done', () => resolve(Buffer.concat(data)))

      //@ts-ignore
      .on('end', () => resolve(Buffer.concat(data)));
  });
}
