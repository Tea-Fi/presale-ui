# TeaPresale

## Prerequisite

- NodeJs 18+.
- run `npm install` to install dependencies.
- create .env file configuration

## .env file

create .env.development inside apps/ui directory and add the followings:

- VITE_WALLET_CONNECT_PROJECT_ID= Get it from <https://cloud.walletconnect.com/sign-in>
- VITE_PUBLIC_INFURA_API= Get it from <https://app.infura.io/login>
- VITE_PUBLIC_INFURA_URL= Get it from <https://app.infura.io/login>

## Development

Run `npm run start` to start the development server. Happy coding!

## Build for production

Run `npm run build` to build the application. The build artifacts are stored in the dist/apps/privatesale directory. ready to be deployed.

### Running production in local

after building app, run thees commands :

`cd dist/`

then run below command in this directory :

`npm run start`
