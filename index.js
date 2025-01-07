import fs from 'fs';
import AWS from 'aws-sdk';

const INPUT = '/mnt/efs/hls'
const BUCKET_NAME = 'vigilance-records';

const s3 = new AWS.S3();

const concatTSFiles = async (dir, name) => {
    try {
        const tsFiles = fs.readdirSync(`${INPUT}/${dir}`).filter(file => file.endsWith('.ts')).slice(20, 608);
        if (tsFiles.length < 10) return

        let bufferVideo = [];
        tsFiles.slice(0, 588)
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
        await s3.putObject(data).promise();
    } catch (error) {
        console.log('error', error)
    }
}

export const handler = async (event) => {
    const directories = fs.readdirSync(INPUT);

    const now = new Date();
    now.setHours(now.getHours() - 6);
    const dateString = now.toISOString().split('T')[0];

    for (const dir of directories) await concatTSFiles(dir, dateString);

    return {
        statusCode: 200,
        body: JSON.stringify('File operation successful!'),
    };
};
