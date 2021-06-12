/**
 * @author Jacques Testoni - Arch Team
 * @since 2021-06-10
 * @link https://docs.aws.amazon.com/pt_br/sdk-for-javascript/v2/developer-guide/s3-example-creating-buckets.html
 */
'use strict'
import * as fs from 'fs';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

export class S3 {

    public async createBucket(bucketName: any) {
        console.log(`Creating Bucket => ${bucketName}`);
        const bucketParams = {
            Bucket: bucketName
        }
        s3.createBucket(bucketParams, (err, data) => {
            if (err)
                throw new Error(`Error creating Bucket : ${err}`);
            else
                console.log(`Bucket - ${data.Location} - successfully created!`)
        })
    }

    public async uploadFile(fileName: any, bucketName: any, folderName?: any) {
        console.log(`Uploading File => ${fileName}`);
        fileName = (folderName) ? folderName + '/' + fileName : fileName;
        const fileStream = fs.createReadStream('resources/' + fileName);

        fileStream.on('error', function (err) {
            throw new Error(`Error Reading file ${fileName}: ${err}`);
        });

        const uploadParams: any = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileStream
        };

        s3.upload(uploadParams, (err, data) => {
            if (err)
                throw new Error(`Error Uploading File: ${err}`);
            else
                console.log('Upload Success', data.Location)
        })
    }

    public getListFiles(bucketName: any, folderName?: any) {
        console.log(`Listing Files => ${bucketName}/${folderName}`);
        var bucketParams = {
            Bucket: bucketName,
            Delimiter: "/",
            MaxKeys: 5,
            Prefix: `${folderName}/`
        };

        return new Promise((resolve, reject) => {
            s3.listObjects(bucketParams, (err: any, data: any) => {
                if (err) {
                    console.error(`Error List: ${err}`)
                    reject(err);
                } else {
                    console.log('List Success')
                    resolve(data.Contents);
                }
            })
        })
    }

    public getFileByKey(bucketName: any, key: any) {
        console.log('Key:', key);
        var bucketParams = {
            Bucket: bucketName,
            Key: key,
        };

        return new Promise((resolve, reject) => {
            s3.getObject(bucketParams, (err: any, data: any) => {
                if (err) {
                    console.error(`Error File: ${err}`)
                    reject(err);
                } else {
                    console.log('File Success', data)
                    resolve(data);
                }
            })
        });
    }

    public getObjectByKey(bucketName: any, key: any) {
        console.log(`Getting Object by key => ${key}`);
        var bucketParams = {
            Bucket: bucketName,
            Key: key,
        };

        s3.getObject(bucketParams, (err: any, data: any) => {
            if (err) {
                throw new Error(`Error Getting Object: ${err}`);
            } else {
                console.log(`Save Object in = > resources/${key} successfully`)
                fs.writeFileSync(`resources/${key}`, data.Body);
            }
        });
    }
}