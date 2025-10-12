# Jamboree Connect

Jamboree Connect(name subject to change) is a platform that allows members of Ridgewood Jamboree to easily connect with merchants, in order to help raise scholarship money for Ridgewood High School's seniors.



## Installation
### Requirements
1. Docker, for building the application
2. Google Account for deploying to Google Cloud(optional)
3. Linux-based operating system (or Mac) with complete access
### Instructions
1. Clone the Github repo with:
   ```bash
    gh repo clone https://github.com/Habdaljalil/Jamboree-App-test
   ```
2. Build the application with:
   ```bash
    sudo docker build -t jamboree-app
   ```
3. Test the application locally with:
   ```bash
    sudo docker run jamboree-app
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
2. Run the following: 
   ```bash
    source .env
   ```
3. Go to https://console.cloud.google.com
4. Create a new project(press ctrl + o) and name it(i.e Jamboree production)
5. Run the command to connect to Google Cloud and create an instance(Google will ask you to sign in with your account and enable some services):
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