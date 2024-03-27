import axios from "axios";
import { useFormik } from "formik";
import React, { useState } from "react";
import { object, string } from "yup";
import MainButton from "../../Components/Common/MainButton";
import ErrorLogo from "../../assets/icons/error.png";
import { Link, useNavigate } from "react-router-dom";
function Login() {
  // -> To handle error's
  const [error, SetError] = useState();

  const navigate = useNavigate();
  // -> Form schema using yup
  const formSchema = object({
    email: string()
      .email("*Follow email @ format")
      .required("*Enter email address"),
    password: string()
      .min(8, "Mimumum 8 character")
      .required("*Password is must"),
  });
  // - > intial user data
  const user_data = {
    email: "",
    password: "",
  };
  // -> handle login api call
  const handleLogin = async (inputData) => {
    const options = {
      url: "http://localhost:3003/login",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      data: inputData,
    };

    axios(options)
      .then((response) => {
        console.log(response);
        if (response.status == 200) {
          //1st store the Token for authorization

          const token = response.data.token;
          localStorage.setItem("token", token);
          navigate("/");
        }
      })
      .catch(function (error) {
        console.log(error);
        //USING ALL EDGE CASES TO SHOW RELEVENT MESSSAGES ON INPUT
        if (error.response.status == 404) {
          SetError("No user found");
        } else if (error.response.status == 403) {
          SetError(
            "Email isn't verified, kindly first verify your email address."
          );
        } else if (error.response.status == 401) {
          SetError("Incorrect password.");
        } else if (error.response.status == 400) {
          SetError("All fields are required.");
        } else {
          SetError("Something went wrong.");
        }
      });
  };

  const formik = useFormik({
    initialValues: user_data,
    validationSchema: formSchema,
    onSubmit: (e) => {
      handleLogin(e);
    },
  });

  return (
    <div className=" bg-gray-100 h-screen w-screen items-center">
      
      <div className="flex flex-wrap justify-center m-auto items-center  bg-white  w-full  sm:w-4/4 h-auto shadows">
         {/* 2nd Div */}
         <div className="w-2/2 h-screen hidden shadows sm:block">
          <img
            className="h-screen"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/DHARAHARA_TOWER.jpg/1200px-DHARAHARA_TOWER.jpg"
            alt=""
          />
        </div>
        <div className="w-full p-5  sm:w-1/2 items-center">
          {/* <h1 className="font-extrabold text-transparent text-6xl bg-clip-text bg-gradient-to-r from-blue-500 to-black">
            Smart RosAi
          </h1> */}
          {/*  */}
          <img
            className="rounded-l-box border-b-base-300 ml-32 "
            width={200}
            src="https://res.cloudinary.com/djmhegxuf/image/upload/v1711527880/Untitled_design_l86sor.png"
            alt=""
          />
          <div className=" w-full items-center">
            <form
              className="form-control w-full m-2"
              onSubmit={formik.handleSubmit}
            >
              <div className="w-4/5">
                <label className="label line1">Email</label>
                <input
                  type="email"
                  className="h-10 input input-bordered w-full"
                  id="email"
                  name="email"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Your email @"
                  autoComplete="on"
                />
                {/* ERROR MSG */}
                {formik.errors.email && formik.touched.email ? (
                  <span className="text-blue-600"> {formik.errors.email}</span>
                ) : null}
              </div>
              <div className="w-4/5">
                <label className="label line1">Password</label>
                <input
                  type="password"
                  className="h-10 input input-bordered w-full"
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="on"
                  placeholder="*_*_*"
                />
                {formik.errors.password && formik.touched.password ? (
                  <span className="text-blue-600">
                    {" "}
                    {formik.errors.password}
                  </span>
                ) : null}
              </div>
              <div className="flex justify-start mt-8">
                <div className="hidden sm:block">
                  <input
                    type="checkbox"
                    // checked="checked"
                    className="checkbox bg-white"
                  />
                  <label htmlFor="" className="ml-2 line2">
                    keep me login
                  </label>
                </div>

                <div className=" ml-0  sm:ml-24">
                  <Link to={"/forgetpwd"} className="line1 cursor-pointer">
                    Forget password?
                  </Link>
                </div>
              </div>
              {/* Error message part */}
              {error == null ? null : (
                <div className="border-2 solid  border-blue-700 bg-blue-700 text-white rounded-lg p-2 w-4/5 ml-2 mt-1 ">
                  <img
                    width={20}
                    src={ErrorLogo}
                    alt=""
                    className="inline mr-2"
                  />
                  <p className="inline font-semibold">{error}</p>{" "}
                </div>
              )}

              <div className="-ml-2 mt-4   sm:mt-8 sm:ml-12">
                <MainButton value={"Login"} />
              </div>
            </form>

            <hr className="mt-6 mb-4 w-2/4 ml-16 " />

            <h4 className="inline line2 text-secondrytext ml-0 sm:ml-12">
              Don't have an account yet?{" "}
              <Link
                to={"/register"}
                className="inline ml-2 cursor-pointer text-black"
              >
                Signup
              </Link>
            </h4>
            <div>
              <h4 className="inline line2 text-secondrytext ml-0 sm:ml-12">
                Explore Jobs?
                <Link
                  to={"/portal/job"}
                  className="inline ml-2 cursor-pointer text-gray-100 bg-gray-700 p-1 rounded-md"
                >
                  View
                </Link>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
