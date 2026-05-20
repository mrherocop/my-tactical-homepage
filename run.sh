#!/bin/bash
# Start a simple background server for the Firefox New Tab Page
cd /home/sayan-pal/Desktop/firefox_homepage
nohup python3 -m http.server 8080 > /dev/null 2>&1 &
echo "Server started on http://localhost:8080"
