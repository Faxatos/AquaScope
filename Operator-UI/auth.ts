import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { Client } from 'cassandra-driver';
import { z } from 'zod';
import bcrypt from 'bcrypt';

import type { User } from '@/app/lib/definitions';
import { users } from '@/app/lib/placeholder-data';

// Initialize the Cassandra client
const client = new Client({
  contactPoints: ['cassandra.cassandra.svc.cluster.local:9042'], //Cassandra host
  localDataCenter: 'datacenter1', //Cassandra datacenter
  keyspace: 'vessel_management', //keyspace
  credentials: { 
    username: 'cassandra', 
    password: 'cassandra' 
  }, 
});

async function getUser(email: string): Promise<User | undefined> {
  try {
    // Query Cassandra for the user with the given email
    const query = 'SELECT id, email, name, password FROM user WHERE email = ?';
    const result = await client.execute(query, [email], { prepare: true });
    
    // If no user is found, return undefined
    if (result.rowLength === 0) {
      return undefined;
    }

    const user = result.rows[0];

    // Map the Cassandra row to a User object
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
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
                
                const user = await getUser(email);
                if (!user) return null;
                //const passwordsMatch = await bcrypt.compare(password, user.password);
                const passwordsMatch = password === user.password
                if (passwordsMatch) return user;
            }

            console.log('Invalid credentials');
            return null;
        },
        }),
    ],
    trustHost: true,
});