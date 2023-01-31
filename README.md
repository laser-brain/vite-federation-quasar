# Vue 3 + Vite + Quasar + Federation Example

This is an example to show how module federation fails when using the component library Quasar

## Run the project

- Install dependencies in remote folder

```sh
$ cd ./remote
$ yarn
```

- Build and provide remote:

```sh
$ yarn serve
```

- Install dependencies in host folder:

```sh
$ cd ./../host
$ yarn
```

- Start host in dev mode:

```sh
$ yarn dev
```
