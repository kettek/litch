# Litch
Litch is a **work-in-progress** application for streamers to improve interactability and fun.

![2022-08-11](screenshot.png)

## Design
Litch uses a modular approach to allow dynamically loading:

  * **Services** for providing Twitch integration, bot support, etc.
  * **Modules** for providing overlay effects such as falling snow, fireworks, PNG tubers, and more

With this design, third-party additions to add custom functionality are just self-contained NPM packages.

## Building/Running
To build all modules, services, and the app, issue:
```shell
npm run build
```

After which the app can be run with:
```shell
npm run start
```

## Developing
When developing the app, issue:
```shell
npm run dev
```

When developing a module or service, enter its directory and issue:
```shell
npm run dev
```

Automatic reloading of the app when a module/service is updated is not implemented. However, issuing a refresh via Ctrl+R within the app will reload modules and services.

## Gregory
![Gregory](packages/app/public/app-128x128.png)

Gregory is the Lich of Litch and is copyright of the Litch Developers. It may not be used for any purpose beyond advertising, embedding, or any usage necessary to link to the Litch software, except where a lich is to be used in a tabletop game, in which case it can be used under the condition that the lich must be called Gregory.