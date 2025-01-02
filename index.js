const path = require('path');
const fs = require('fs');

const AWS = require('aws-sdk');

const BUCKET_NAME = 'vigilance-records';
const REGION = 'us-east-1';

const s3 = new AWS.S3({
  params: { Bucket: BUCKET_NAME, region: REGION },
});

const OUPUT = 'mp4'
const INPUT = '/efs/hls'

const concatTSFiles = async (dir, output, name) => {
  try {
    const tsFiles = fs.readdirSync(`${INPUT}/${dir}`).filter(file => file.endsWith('.ts')).slice(20);
    const writeStream = fs.createWriteStream(output);

    for (const tsFile of tsFiles) {
      const fileName = path.join(__dirname, `${INPUT}/${dir}/${tsFile}`)
      const readStream = fs.readFileSync(fileName);
      writeStream.write(readStream);
    }
    writeStream.end();

    const dataFile = fs.readFileSync(output);

    const data = {
      Bucket: BUCKET_NAME,
      Key: `${OUPUT}/${dir}/${name}.mp4`,
      Body: dataFile,
      ContentType: 'application/text',
    };
  
    await s3.upload(data).promise();
  } catch {

  }
}

const main = async () => {
  const directories = fs.readdirSync(INPUT);

  const now = new Date();
  now.setHours(now.getHours() - 6);
  const dateString = now.toISOString().split('T')[0];

  for (const dir of directories) {
    concatTSFiles(dir, `${OUPUT}/${dateString}.mp4`, dateString);
  }
}

main();