import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";

export const options = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {},
      async authorize(
        credentials: { email?: string; password?: string } | undefined,
        req: any
      ) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const { email: userName = "", password = "" } = credentials;

        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/users/loginUser`;
          const { data: response } = await axios.post(url, {
            userName,
            password,
          });

          if (response) {
            return response;
          }

          throw new Error("User not found");
        } catch (error: any) {
          throw new Error(error.response.data.message || error.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/reports/login",
    signOut: "/reports/login",
    error: "/reports/error",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXT_PUBLIC_AUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.id = user._id;
        token.userName = user.userName;
        token.email = user.email;
        token.accessToken = user.token;
      }
      return token;
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      session.user.id = token._id;
      session.user.userName = token.userName;
      session.user.email = token.email;
      session.accessToken = token.accessToken;

      return session;
    },
  },
};
