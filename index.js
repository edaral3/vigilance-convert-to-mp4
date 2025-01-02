const path = require('path');
const fs = require('fs');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET_NAME = 'vigilance-records';
const REGION = 'us-east-1';

const INPUT = '/efs/hls'

const concatTSFiles = async (dir, name) => {
  try {
    const tsFiles = fs.readdirSync(`${INPUT}/${dir}`).filter(file => file.endsWith('.ts')).slice(20);
    if(tsFiles.length < 10) return
    
    let bufferVideo = [];
    for (const tsFile of tsFiles) {
      const readStream = fs.readFileSync(`${INPUT}/${dir}/${tsFile}`);
      bufferVideo.push(readStream)
    }

    const data = {
      Bucket: BUCKET_NAME,
      Key: `${dir}/${name}.mp4`,
      Body: Buffer.concat(bufferVideo),
      ContentType: 'video/mp4',
    };
    
    const asd = await s3.putObject(data).promise();
  } catch (error) {
    console.log('error', error)
  }
}

const main = async () => {
  const directories = fs.readdirSync(INPUT);

  const now = new Date();
  now.setHours(now.getHours() - 6);
  const dateString = now.toISOString().split('T')[0];

  for (const dir of directories) {
    concatTSFiles(dir, dateString);
  }
}

main();
