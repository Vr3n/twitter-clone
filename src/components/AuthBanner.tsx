import { signIn, useSession } from "next-auth/react";
import React from "react";
import Container from "./Container";

const AuthBanner = () => {
  const { data: session } = useSession();

  console.log("User session: ", session);

  return (
    <>
      {session?.user ? null : (
        <div className="fixed bottom-0 w-full bg-black p-4">
          <Container classNames="bg-transparent flex justify-between items-center text-white">
            <p className="text-2xl text-white">Do not miss out!</p>
            <button className="btn-primary" onClick={() => signIn()}>
              Login
            </button>
          </Container>
        </div>
      )}
    </>
  );
};

export default AuthBanner;
