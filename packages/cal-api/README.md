Note: make code changes in the /src file. /lib is generated code and not something we should change.

# NPM module publishing basics

1. Run `npm run build` to build the project and generate the files in the /lib folder
2. Update the version number in the package.json file. We use [semantic versioning](https://semver.org/)
3. Run `npm publish` to publish a new version of the package
4. Import the package into a project by running `npm install @insightorchards/calendar-ui@<version-number>`
5. Projects installing this package will need an `.npmrc` file in their root with a personal access token, e.g.

```
@insightorchards:registry=https://npm.pkg.github.com
always-auth=true
//npm.pkg.github.com/:_authToken=<token-goes-here>
```
