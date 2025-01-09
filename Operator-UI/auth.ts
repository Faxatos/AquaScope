import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { Client } from 'cassandra-driver';
import { z } from 'zod';
import bcrypt from 'bcrypt';

import type { User } from '@/app/lib/definitions';
import { users } from '@/app/lib/placeholder-data';

const client = new Client({
  contactPoints: ['cassandra.cassandra.svc.cluster.local:9042'], // replace with your Cassandra node IPs
  localDataCenter: 'datacenter1', // replace with your Cassandra data center name
  keyspace: 'vessel_management', // replace with your Cassandra keyspace
});

async function getUser(email: string): Promise<User | undefined> {
  try {
    // Query Cassandra for the user with the given email
    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await client.execute(query, [email], { prepare: true });
    
    // If no user is found, return undefined
    if (result.rowLength === 0) {
      return undefined;
    }

    // Assuming the first row contains the user data
    const user = result.rows[0];

    // Map the Cassandra row to a User object
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,  // Adjust column names as necessary
      // Add any other fields as needed
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user from Cassandra.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

            console.log(parsedCredentials)
            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;

                if (email === "in@in.com") {
                  const specialUser = {
                    id: "special-user-id",  // This should be the ID of the special user
                    email: "in@in.com",
                    name: "Special User",  // You can provide a name if needed
                    // Add any other user fields here that you want to associate with the "special" user
                  };
                  console.log("Special case login for in@in.com");
                  return specialUser;  // Return the "special" user
                }
                
                const user = await getUser(email);
                if (!user) return null;
                //const passwordsMatch = await bcrypt.compare(password, user.password);
                const passwordsMatch = password === user.password
                console.log(passwordsMatch)
                if (passwordsMatch) return user;
            }

            console.log('Invalid credentials');
            return null;
        },
        }),
    ],
    trustHost: true,
});