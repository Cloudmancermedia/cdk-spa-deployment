import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CdkSpaDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = 'domainname.com'

    const hostedZone = new HostedZone(
      this,
      'HostedZone',
      {
        zoneName: domainName
      }
    );

    const cert = new Certificate(
      this,
      'Cert',
      {
        domainName,
        validation: CertificateValidation.fromDns(hostedZone)
      }
    );

    const frontendBucket = new Bucket(
      this,
      'FEBucket',
      {
        bucketName: 'your-bucket-name',
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true
      }
    );

    const oai = new OriginAccessIdentity(
      this,
      'OAI'
    )
    frontendBucket.grantRead(oai);

    const distribution = new Distribution(
      this,
      'Distribution',
      {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new S3Origin(
            frontendBucket,
            {
              originAccessIdentity: oai
            }
          ),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
        domainNames: [domainName],
        certificate: cert
      }
    );

    const aRecord = new ARecord(
      this,
      'ARecord',
      {
        zone: hostedZone,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
      }
    );
  }
}
