# README

## Overview

A Serverless application that takes a "message" and "phoneNumber", publishes this to an SNS Topic, which has an SQS Queue subscribed to it, finally triggering a a function to send the message via SMS.

The Lambda functions are built and tested using Typescript and Jest and uses the Serverless Framework to deploy to AWS.  This orchestartes the deployment of the Lambdas, SNS Topic, SQS Queue, and API Gateway for the exposed endpoint.

## Challenges

1. Having not used Serverless Framework before, I spent some time to learn and practise by setting up some basic lambda functions and ensuring they deployed correctly. Quite an interesting tool to easily move towards an infrastructure-by-code approach
2. Assigning correct IAM roles to each of the Lambdas in order to give them correct permission to publish to SNS.  One needed to publish just to a single topic while the other needed permissions to send SMS messages.  This can be achieved by creating the Policy under the "Resources" section of the `serverless.yml` file and then assigning the role to the function.
3. Sending SMS messages from my AWS account is currently in Sandbox mode, so can only send messages to verified destination phone numbers.
4. Would have liked to test the SNS Adapter functions to ensure the SNS Client is publishing to the correct topic name and phone number. However this is testing internal implementations, which is usually avoided, and the tests were becoming quite complicated due to the nature of mocking with Jest and inspecting arguments.
5. Have not directly used Webpack previously. Given there are very few dependencies required and code is fairly lightweight, decided to skip this setup in the interest of time.
