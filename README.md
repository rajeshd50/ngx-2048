# ngx-2048

Angular 5 component for the popular game 2048.

## Demo

See here a demo made with angular5 (aot build) [click here](https://test-7885f.firebaseapp.com/)

## Usages

First install the module,

`npm i ngx2048 --save`

then Import it
`import { Ng2048Module } from 'ngx-2048';`

Then add to import section of your app

Then, just add the component where you want to display it.

`<app-game-2048 [config]="config"></app-game-2048>`

More on config later.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

Thanks.. :)