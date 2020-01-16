# Ruoka-bot

Ever wondered where your group should go to eat?

Wonder no longer!!?!?!
This bot will tell you what food the Tampere University Hervanta Campus has to offer and show a poll where your group can decide where to go.

Automaticly

Every

Single

Day

At

10.30 AM

## Installation

[Yarn](https://yarnpkg.com/lang/en/)
[Firebase-cli](https://firebase.google.com/docs/cli)

You will also need a telegram bot to test things:
[Bots](https://core.telegram.org/bots)

```bash
git clone https://github.com/nipatiitti/ruokablo-bot
cd ruokablo-bot
firebase init

cd ./functions
yarn install
```

## Usage

You will need a firebase project to do this. Follow the instructions on the firebase site to set it up
[Firebase](https://console.firebase.google.com/)
Also activate the functions for that project
[Funtcions](https://firebase.google.com/docs/functions)

Then in the `/functions` folder
```bash
yarn deploy
```

This will deploy the project to firebase. 

Then you will need to set the bot's webhook properly.
[Telegram webhook tutorial](https://core.telegram.org/bots/api#setwebhook)

The url should look like
https://<your firebase functions url>/apiEndPoint/<The end part of your bot token>

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
