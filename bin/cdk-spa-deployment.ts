#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CdkSpaDeploymentStack } from '../lib/cdk-spa-deployment-stack';

const app = new App();
new CdkSpaDeploymentStack(app, 'CdkSpaDeploymentStack', {

});