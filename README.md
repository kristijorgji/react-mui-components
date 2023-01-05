# react-mui-components

A project that is going to export additional react material ui components that are not provided in the default bundle.

Work is in progress.

# How to develop

You can use `yarn storybook` command to open storybook and develop there the component.

If you want to try the library inside a client project there are two ways to do that

#### Method 1 (recommended)

Run `yarn link` here in the library root

Then build the library `yarn build`

Afterward cd into your client project root and run
```yarn link react-mui-components```

This is going to tell yarn to use the locally linked library.
Afterward you can add this library normallly with `yarn add react-mui-components` and use it.
Everytime you build the library the update is taken automatically (via linked folders).

#### Method 2
```shell
yarn build
```

then go to your client project and run
```shell
yarn add react-mui-components@file:/yourpath/react-mui-components
```
Then you can import the components and try them out
Note: You have to run yarn install everytime you update the library (rebuild using yarn build).

For both methods 1 and 2 you have to run
Run 
```shell
dev/link-react.sh path-to-client-project
```
to avoid the error `Invalid Hook Call Warning` created by importing reacts two times in the build process, one time from client and one time from library node_modules

This command will link react and react-dom used by this library to the ones used by the client project. 

# Commands
`yarn storybook` - used to develop

`yarn build` - compiles the library into `lib` folder together with the exported typescript types 
