---
title: "How to Manage Resources in Terraform State"
subtitle: ""
date: 2024-05-31
draft: false
author: "Mike Vu"
description: "HHow to Manage Resources in Terraform State"
tags: [AWS, Terraform, IAC]
categories: [Guides]
layout: background
---

## What is a State File?

Terraform stores information about your infrastructure in a state file. This state file keeps track of resources created by your configuration and maps them to real-world resources.

When you run `terraform apply` or `terraform destroy` against your initialized configuration, Terraform writes metadata about your configuration to the state file and updates your infrastructure resources accordingly. 

## State File Project

In this project, we will create an AWS instance and security group, examine the project's state file, and use Terraform to remove infrastructure from the project's state.

## Prerequisites

- <a href = "https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli">Terraform CLI 1.7+</a>
- <a href = "https://aws.amazon.com/free/">An AWS Account</a>
- <a href = "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html">AWS CLI</a>
- <a href = "https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html">AWS credentials configured locally</a> with your access keys and a default region.

## Create Infrastructure State

Clone the <a href = "https://github.com/hashicorp/learn-terraform-state"> Learn Terraform State Management repository</a>

```
$ git clone git clone https://github.com/hashicorp/learn-terraform-state.git
```

Change into the new directory:

```
$ cd learn-terraform-state
```
Review the `main.tf` file. This configuration deploys an Ubuntu EC2 instance publicly accessible on port 8080.

```
provider "aws" {
  region = var.aws_region
}
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}
resource "aws_security_group" "sg_8080" {
  name = "terraform-learn-state-sg-8080"
  ingress {
    from_port   = "8080"
    to_port     = "8080"
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  // connectivity to ubuntu mirrors is required to run `apt-get update` and `apt-get install apache2`
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_instance" "example" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.sg_8080.id]
  user_data              = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y apache2
              sed -i -e 's/80/8080/' /etc/apache2/ports.conf
              echo "Hello World" > /var/www/html/index.html
              systemctl restart apache2
              EOF
  tags = {
    Name = "terraform-learn-state-ec2"
  }
}
```

This configuration uses the AWS provider to create an EC2 instance and a security group that allows public access.

Initialize the directory.

```
$ terraform init
Initializing the backend...
Initializing provider plugins...
- Reusing previous version of hashicorp/aws from the dependency lock file
- Installing hashicorp/aws v5.31.0...
- Installed hashicorp/aws v5.31.0 (signed by HashiCorp)
Terraform has been successfully initialized!
You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.
If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

After Terraform initializes, apply the configuration and approve the run by typing yes at the prompt.

```
$ terraform apply
data.aws_ami.ubuntu: Reading...
data.aws_ami.ubuntu: Read complete after 0s [id=ami-027a754129abb5386]
Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create
Terraform will perform the following actions:
  # aws_instance.example will be created
  + resource "aws_instance" "example" {
##...
Plan: 2 to add, 0 to change, 0 to destroy.
Changes to Outputs:
  + aws_region     = "us-east-1"
  + instance_id    = (known after apply)
  + public_ip      = (known after apply)
  + security_group = (known after apply)
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.
  Enter a value: yes
aws_security_group.sg_8080: Creating...
aws_security_group.sg_8080: Creation complete after 3s [id=sg-0adfd0a0ade3eebdc]
aws_instance.example: Creating...
aws_instance.example: Still creating... [10s elapsed]
aws_instance.example: Still creating... [20s elapsed]
aws_instance.example: Still creating... [30s elapsed]
aws_instance.example: Creation complete after 32s [id=i-05a8893f05c6a37be]
Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
Outputs:
aws_region = "us-east-1"
instance_id = "i-05a8893f05c6a37be"
public_ip = "18.212.104.187"
security_group = "sg-0adfd0a0ade3eebdc"
```
## Examine the state file

Now that you have applied this configuration, you have a local state file that tracks the resources Terraform created. Check your directory to confirm the `terraform.tfstate` file exists.

```
$ ls -1
LICENSE
README.md
main.tf
new_state
outputs.tf
terraform.tf
terraform.tfstate
variables.tf
```
You should not manually change information in your state file in a real-world situation to avoid unnecessary drift between your Terraform configuration, state, and infrastructure. Any change in state could result in your infrastructure being destroyed and recreated at your next `terraform apply`.

Open the `terraform.tfstate` file in your file editor.

This example contains few resources, so your actual state file is relatively small.

This file is the JSON encoded state that Terraform writes and reads at each operation. The first stanza contains information about your Terraform application.

## Explore `resources` in state

The `resources` section of the state file contains the schema for any resources you create in Terraform. Review the `resources` section of this file.

```
  "resources": [
    {
      "mode": "data",
      "type": "aws_ami",
      "name": "ubuntu",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": {
            "architecture": "x86_64",
            "arn": "arn:aws:ec2:us-east-1::image/ami-027a754129abb5386",
      ##...
    },
    ##...
]
```
The first key in this schema is the `mode`. Mode refers to the type of resource Terraform creates — either a resource (`managed`) or a data source (`data`). The `type` key refers to the resource type - in this case, the `aws_ami` type is a resource available in the `aws` provider.

##FIXME

```
##...
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "example",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "ami": "ami-027a754129abb5386",
            "arn": "arn:aws:ec2:us-east-1:949008909725:instance/i-05a8893f05c6a37be",
            "associate_public_ip_address": true,
            "availability_zone": "us-east-1a",
##...
            "public_ip": "18.212.104.187",
##...
            "secondary_private_ips": [],
            "security_groups": [
              "terraform-learn-state-sg-8080"
            ],
            "source_dest_check": true,
            "spot_instance_request_id": "",
            "subnet_id": "subnet-0e75b9376618c682a",
            "tags": {
              "Name": "terraform-learn-state-ec2"
            },
##...
      }
    }
  ]
},
```
The `aws_instance` type is a `managed` resource with the AMI from the data.aws_ami source.

The `instances` section in this resource contains the `attributes` of the resource. The `security_groups` attribute, for example, is captured in plain text in state as opposed to the variable interpolated string in the configuration file.

Terraform also marks dependencies between resources in state with the built-in dependency tree logic.

```
##...
          "dependencies": [
            "aws_security_group.sg_8080",
            "data.aws_ami.ubuntu"
          ]
##...
```
Because your state file has a record of your dependencies, enforced by you with a `depends_on` attribute or by Terraform automatically, any changes to the dependencies will force a change to the dependent resource.
