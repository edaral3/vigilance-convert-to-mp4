const path = require('path');
const fs = require('fs');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET_NAME = 'vigilance-records';
const REGION = 'us-east-1';

const OUPUT = '/mp4'
const INPUT = '/efs/hls'

const concatTSFiles = async (dir, name) => {
  try {
    const output = `${OUPUT}/${dir}/${name}.mp4`;
    const tsFiles = fs.readdirSync(`${INPUT}/${dir}`).filter(file => file.endsWith('.ts')).slice(20);
    if(tsFiles.length < 10) return
    
    const writeStream = fs.createWriteStream(output);
    let video = '';
    for (const tsFile of tsFiles) {
      const fileName = `${INPUT}/${dir}/${tsFile}`
      const readStream = fs.readFileSync(fileName);
      video +=readStream
      writeStream.write(readStream);
    }
    writeStream.end();

    const dataFile = fs.readFileSync(output);

    const data = {
      Bucket: BUCKET_NAME,
      Key: `${dir}/${name}.mp4`,
      Body: readStream,
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
