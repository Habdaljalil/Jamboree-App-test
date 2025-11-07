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
2.  Make a .env file with the following format and fill in the values.
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
    sudo docker run -p 8080:8080 --env-file .env jamboree-app
   ```

Once you have seen that the local version works, proceed to deploy to Google Cloud
### Google Cloud Deployment

1. Go to https://console.cloud.google.com
2. Create a new project(press ctrl + o) and name it(i.e Jamboree production)
3. Run the command to connect to Google Cloud and create an instance(Google will ask you to sign in with your account and enable some services):
    ```bash
    sudo chmod +x google-cloud-deploy.sh
    
    ./google-cloud-deploy.sh
    ```
#### Safety: Make sure that there is no `jamboree` Artifact Registry, otherwise the script will fail.
#### Note: The token (ridgewood-jamboree) is the name of the cloud instance. To view it, press `.`, then click Cloud Run --> overview
4. This operation may take up to 90 seconds; in Cloud Run Overview, click on the name of the instance(ridgewood-jamboree), then you will see the URL and the source code, which you can edit.
## Usage
1. Google allows you to edit and redeploy the code, which is needed to update the environment variables to point to the correct Google Sheet, API key, *etc*
2. Although optional, the folders `attached_assets` and `.local` can be removed
### Explanation of Environment Variable Format:
```.env
    VITE_SHEET_ID=
    VITE_API_KEY=
    VITE_MERCHANTS_RANGE=
    VITE_VOLUNTEERS_RANGE=
    VITE_APPS_SCRIPT_URL=
   ```
- `VITE_SHEET_ID` should be the sheet ID of the Google Sheet in use, such as `1_Qdj1r72EYqqdoooAdz7L-L5TbA9J51vP7DOqrNoEHc`
#### Note: Don't put quotation marks around anything and don't leave a whitespace between the value and the equals sign
- `VITE_API_KEY` This is your Google Api Key
- `VITE_MERCHANTS_RANGE` This the Google Sheets range for the columns containing merchant data. For example, `Sheet1!A:M`. It includes the sheet, as each file can have multiple and the range. `A:M` means all the columns starting at A to L(inclusive) because the range is [A,M), M is not included
- `VITE_VOLUNTEERS_RANGE` This is the same as above
- `VITE_APPS_SCRIPT_URL=` This is the link to the macro executable that rests direcly on the Google Sheet. For example, 
`https://script.google.com/macros/s/Some-id/exec`. `Some-id` is the ID of the script, which can be found in the macros editor. The important part is `/exec`, as it allows for execution of functions within the script; it serves as a built-in API.


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
