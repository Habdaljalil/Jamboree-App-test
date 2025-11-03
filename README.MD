# Jamboree Connect

Jamboree Connect(name subject to change) is a platform that allows members of Ridgewood Jamboree to easily connect with merchants, in order to help raise scholarship money for Ridgewood High School's seniors.



## Installation
### Requirements
1. Docker(version 24.0.7), for building the application
2. Google Account for deploying to Google Cloud(optional)
3. Ubuntu version >= 22.04 with root privileges
4. Git, github
5. Google CLI
### Pre-install Instructions
1. To install the Google cloud CLI, run:
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
1. Clone the Github repository and go into it with:
   ```bash
    gh repo clone https://github.com/Habdaljalil/Jamboree-App-test

    cd Jamboree-App-test
   ```
<<<<<<< HEAD
2.  Make a .env file with the following format and fill in the values.
=======
2. Install docker using the provided script:
   ```bash
      sudo chmod +x dockerinstall.sh

      ./dockerinstall.sh
   ```
3. Build the application with:
   ```bash
    sudo docker build . -t jamboree-app --no-cache
   ```
4. Test the application locally with:
   ```bash
    sudo docker run -p 8080:8080 --env-file .env jamboree-app
   ```

Once you have seen that the local version works, proceed to deploy to Google Cloud
### Google Cloud Deployment
1. Make a .env file with the following format and fill in the values.
>>>>>>> 277b7a9f9f8c5ae0682aeb2501e6556a43d02acc
   ```.env
    VITE_SHEET_ID=
    VITE_API_KEY=
    VITE_MERCHANTS_RANGE=
    VITE_VOLUNTEERS_RANGE=
    VITE_APPS_SCRIPT_URL=
   ```
#### Note: To get the keys for a demo setup, contact me at habdaljalil10@gmail.com, if you do not have them already.
3. Run the following: 
   ```bash
    source .env
   ```
4. Install docker using the provided script, and enable the .env file:
   ```bash
      sudo chmod +x dockerinstall.sh

      ./dockerinstall.sh

      source .env
   ```
5. Build the application with:
   ```bash
    sudo docker compose build --no-cache jamboree-app
   ```
6. Test the application locally with:
   ```bash
    sudo docker run -p 8080:8080 jamboree-app
   ```

Once you have seen that the local version works, proceed to deploy to Google Cloud
### Google Cloud Deployment

1. Go to https://console.cloud.google.com
2. Create a new project(press ctrl + o) and name it(i.e Jamboree production)
3. Run the command to connect to Google Cloud and create an instance(Google will ask you to sign in with your account and enable some services):
    ```bash
    gcloud run deploy ridgewood-jamboree --source . --region us-east4 --allow-unauthenticated --set-env-vars VITE_SHEET_ID=$VITE_SHEET_ID,VITE_API_KEY=$VITE_API_KEY,VITE_MERCHANTS_RANGE=$VITE_MERCHANTS_RANGE,VITE_VOLUNTEERS_RANGE=$VITE_VOLUNTEERS_RANGE,VITE_APPS_SCRIPT_URL=$VITE_APPS_SCRIPT_URL
    ```
#### Note: The token (ridgewood-jamboree) is the name of the cloud instance. To view it, press `.`, then click Cloud Run --> overview
4. This operation may take up to 90 seconds; in Cloud Run Overview, click on the name of the instance(ridgewood-jamboree), then you will see the URL and the source code, which you can edit.
## Usage
1. Google allows you to edit and redeploy the code, which is needed to update the environment variables to point to the correct Google Sheet, API key, *etc*
2. Although optional, the folders `attached_assets` and `.local` can be removed
## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
