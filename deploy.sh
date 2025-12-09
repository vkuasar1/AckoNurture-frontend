#!/bin/bash
cd /home/ec2-user/AckoNurture-frontend
git fetch --all
git reset --hard origin/main
npm install
npm run build
sudo systemctl restart AckoNurture-frontend
