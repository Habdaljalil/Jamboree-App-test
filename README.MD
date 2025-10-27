# Jamboree Connect

Jamboree Connect(name subject to change) is a platform that allows members of Ridgewood Jamboree to easily connect with merchants, in order to help raise scholarship money for Ridgewood High School's seniors.



## Installation
### Requirements
1. Docker(version 24.0.7), for building the application
2. Google Account for deploying to Google Cloud(optional)
3. Ubuntu, or any of its sub-distros that utilize Ubuntu version 22.04 or higher.
4. Git, github
5. Google CLI
### Pre-install Instructions
1. To set up the Docker pre-install, run the commands:
```bash
# Add Docker's official GPG key:
sudo apt-get update

sudo apt-get install ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
```
2. To install the desired version of Docker, version 24.0.7, run:
```bash
VERSION_STRING=5:24.0.7-0ubuntu2~ubuntu.22.04~jammy

sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin
```
3. To install the Google cloud CLI, run:
```bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates gnupg curl -y

curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg

echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list

sudo apt-get update
sudo apt-get install google-cloud-cli
```
### Instructions
1. Clone the Github repo with:
   ```bash
    gh repo clone https://github.com/Habdaljalil/Jamboree-App-test
   ```
2. Build the application with:
   ```bash
    sudo docker build . -t jamboree-app --no-cache
   ```
3. Test the application locally with:
   ```bash
    sudo docker run -p 8080:8080 jamboree-app
   ```
Once you have seen that the local version works, proceed to deploy to Google Cloud
### Google Cloud Deployment
1. Make a .env file with the following format and fill in the values.
   ```.env
    VITE_SHEET_ID=
    VITE_API_KEY=
    VITE_MERCHANTS_RANGE=
    VITE_VOLUNTEERS_RANGE=
    VITE_APPS_SCRIPT_URL=
   ```
#### Note: To get the keys for a demo setup, contact me at habdaljalil10@gmail.com, if you do not have them already.
1. Run the following: 
   ```bash
    source .env
   ```
2. Go to https://console.cloud.google.com
3. Create a new project(press ctrl + o) and name it(i.e Jamboree production)
4. Run the command to connect to Google Cloud and create an instance(Google will ask you to sign in with your account and enable some services):
    ```bash
    gcloud run deploy ridgewood-jamboree --source . --region us-east4 --allow-unauthenticated --set-env-vars VITE_SHEET_ID=$VITE_SHEET_ID,VITE_API_KEY=$VITE_API_KEY,VITE_MERCHANTS_RANGE=$VITE_MERCHANTS_RANGE,VITE_VOLUNTEERS_RANGE=$VITE_VOLUNTEERS_RANGE,VITE_APPS_SCRIPT_URL=$VITE_APPS_SCRIPT_URL
    ```
#### Note: The token (ridgewood-jamboree) is the name of the cloud instance. To view it, press `.`, then click Cloud Run --> overview
1. This operation may take up to 90 seconds; in Cloud Run Overview, click on the name of the instance(ridgewood-jamboree), then you will see the URL and the source code, which you can edit.
## Usage
1. Google allows you to edit and redeploy the code, which is needed to update the environment variables to point to the correct Google Sheet, API key, *etc*
2. Although optional, the folders `attached_assets` and `.local` can be removed
## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
