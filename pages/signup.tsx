import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@components/button";
import Input from "@components/input";
import { cls } from "@libs/client/utils";
import { useRouter } from "next/router";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";

interface EnterForm {
  email: string;
  password: string;
}

interface TokenForm {
  token: string;
}

interface MutationResult {
  ok: boolean;
}

const Enter: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { register, reset, handleSubmit } = useForm<EnterForm>();
  const [signup, { loading, data }] = useMutation(`/api/user/signup`);
  const [method, setMethod] = useState<"email">("email");
  const onValid = (formData: EnterForm) => {
    if (loading) return;
    signup(formData);
  };
  useEffect(() => {
    if (data && data?.ok) {
      router.push("/enter");
    }
    if (user) {
      router.push("/");
    }
  }, [data, router, user]);
  return (
    <div className="flex justify-center h-screen">
      <div className="mt-16 px-4 w-11/12 max-w-xl">
        <h3 className="text-center text-3xl font-bold">Sign In to PPoStudy</h3>
        <div className="mt-12">
          {false ? (
            <form className="mt-8 flex flex-col space-y-4">
              <Input
                name="token"
                label="Confirmation Token"
                type="number"
                required
              />
              <Button text={"Confirm Token"} />
            </form>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <div className="mt-8  grid  w-full grid-cols-2 border-b ">
                  <button
                    className={cls(
                      "border-b-2 pb-4 text-sm font-medium",
                      method === "email"
                        ? " border-orange-500 text-orange-400"
                        : "border-transparent text-gray-500 hover:text-gray-400"
                    )}
                  >
                    Email
                  </button>
                </div>
              </div>
              <form
                onSubmit={handleSubmit(onValid)}
                className="mt-8 flex flex-col space-y-4"
              >
                <Input
                  register={register("email", {
                    required: true,
                  })}
                  name="email"
                  label="Email address"
                  type="email"
                  required
                  onChange={() => (data.error = "")}
                />
                <Input
                  register={register("password", {
                    required: true,
                  })}
                  name="password"
                  label="Password"
                  type="password"
                  required
                />
                {data?.error ? (
                  <span className="text-center font-semibold text-red-500">
                    {data?.error}
                  </span>
                ) : (
                  ""
                )}
                <Button loading={loading} text={"Get login link"} />
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Enter;
