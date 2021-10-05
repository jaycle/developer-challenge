# Kaleido Library DApp

This is a demo DApp to allow tracking of library books between separate branches. Separate counties and municipalities often have their own library system and books must be returned to the same library or branch. By utilizing an NFT for a unique instance of a book, separate branches can track assets that originated from their branch while allowing transfer to others.

## How to Run

Similar to the initial project, npm install and start both the frontend/ and backend/ folders in separate terminals.

The backend depends on a postgres database. For demo, this can be accomplished through a oneline docker command:

`docker run --rm --name postgres -e POSTGRES_PASSWORD=mypass -p 5432:5432 -d postgres`

With Kaleido configured with multiple nodes, the signing ids can be updated in the library-branches seeder (db/seeders dir). With seed data up to date, and postgres running, the following two commands, issued from backend/ dir, will initialize the schema and branch data:

- `npx sequelize-cli db:migrate`
- `npx sequelize-cli db:seed --seed 20211001042903-library_branches.js`

## How it works
1. Select a branch as operational context (theoretically, these branches may be building different Dapps).
2. Create Books
3. View List of Books and Transfer them around

While the UI and backend maintain state for easier querying and display, the Smart Contract (Basic NFT) ensures that transfer of ownership only happens from the owning entity and to a valid recipient. Ownership can also be verified by a third party (like the Kaleido dashboard).
