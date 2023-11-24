# Ethereum IERC PoW Miner Program

This Ethereum IERC PoW Miner Program is a Node.js command-line application that enables users to interact with Ethereum wallets and perform PoW mining.
## Installation

### Prerequisites

Before installing the program, ensure you have Node.js installed on your system. If not, follow these steps to install Node.js:

1. Visit [Node.js official website](https://nodejs.org/).
2. Download the Node.js installer for your operating system.
3. Follow the installation instructions to install Node.js and npm.

### Setting Up the Program

Once Node.js is installed, you can set up the Ethereum IERC PoW Mining Program:
To use this program, ensure you have Node.js installed on your system. Clone the repository and install dependencies:

```bash
git clone https://github.com/IErcOrg/ierc-miner-js
cd ierc-miner-js
npm i -g yarn
yarn install
```

## Usage

1. configure
- edit tokens.json, add workc and amt
- copy .env.example to .env, edit your provider, wallet, private key and mine times

2. pow mine
```shell
yarn cli mine <tick>
```
