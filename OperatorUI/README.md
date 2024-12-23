## Operator UI

This Operator UI is based on the Next.js Framework. It allows the operators to navigate a map (implemented through [MapLibre](https://maplibre.org/)) containing the vessels' positions, to check the alarms coming from those vessels, and the AIS logs coming from the vessels.

## Usage

### Requirements

Before you begin, ensure that you have the following installed:

  1. Node.js: This project requires Node.js (v14.x or higher). You can download and install it from the official website or use a version manager like nvm.
  
	  To verify your Node.js version:
	  ```
	  node -v
	  ```

2. **pnpm**: a fast, disk space-efficient package manager for Node.js.

	Install pnpm globally:
	```
	npm install -g pnp
	```

### Installation

Clone the repository to your local machine:

```
git clone https://github.com/Faxatos/AquaScope.git
```

Navigate to the `OperatorUI` folder:

```
cd OperatorUI
```

Install the necessary dependencies using **pnpm**:

```
pnpm install
```

Start the development server:

```
pnpm dev
```

This will launch the Next.js app, and you can view it in your browser at: http://localhost:3000

### ToDos:

- Logs page
- Vessels page
- Create package
- Connect DBs to fetch data
- Implement LogIn
- Fix skeleton pages

  