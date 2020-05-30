import * as AWS from 'aws-sdk'
import * as fs from 'fs'

const loadAWSConfig = () => {
  if (process.env.NODE_ENV == 'production') {
    AWS.config.update({
      apiVersion: '2010-12-01',
      accessKeyId: fs.readFileSync('/run/secrets/AWS_ACCESS_KEY_ID').toString(),
      secretAccessKey: fs
        .readFileSync('/run/secrets/AWS_SECRET_ACCESS_KEY')
        .toString(),
      region: 'us-east-1'
    })
  } else {
    AWS.config.loadFromPath('./.aws.json')
  }
}

export default loadAWSConfig
