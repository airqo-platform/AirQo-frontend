# create-vertex-app

Built for anyone with an IoT project who wants to spend less time building the dashboard and more time on what their project actually does. It started as [AirQo](https://airqo.net)'s own device management dashboard, but it's been opened up so anyone can use it for any kind of IoT device.

## Usage

```bash
npm create @airqo/vertex-app@latest my-app
# or
pnpm create @airqo/vertex-app my-app
# or
npx @airqo/create-vertex-app my-app
# or
npm create @airqo/vertex-app@latest my-app -- --yes \
  --org-name "KCCA Air Quality" --short-name KCCA \
  --color "#00A86B" --tiles openstreetmap
```

You'll be asked a few questions (your organization's name, a color, which map to use), then:

```bash
cd my-app
npm install
npm run dev
```


Everything else — turning features on or off, links, logins, connecting your own data — is set in a file called `vertex.config.ts` that gets created in your new project. Open `vertex.config.example.ts` in the project for a version with notes explaining each setting.

## Contribute to this project

We'd love your help improving create-vertex-app. Please read the [AirQo Frontend contribution guide](https://github.com/airqo-platform/AirQo-frontend/blob/staging/CONTRIBUTING.md) before opening a pull request.

## License

MIT © AirQo