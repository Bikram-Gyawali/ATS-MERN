import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteIcon from "../../../assets/icons/delete.svg";
import SocialIcon from "../../../assets/icons/share.svg";
import { ToastContainer, toast } from "react-toastify";

function CreatedJobElement({ data, setData }) {
  const navigate = useNavigate();
  const handleJob = (id) => {
    navigate(`/JobDetails/${id}`);
  };

  const notify = () =>
    toast.success("Job Status Updated Successifully", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleJobStatus = (id, job_status) => {
    console.log("status", job_status, id);
    // axios POST request
    const options = {
      url: "http://localhost:3003/job/update-job-status",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      data: { id, job_status },
    };

    axios(options)
      .then((response) => {
        if (response.status == 200) {
          notify();
          fetchJobList()
          // setTimeout(() => {
          //   navigate(-1);
          // }, 1000);
        } else if (response.status == 300) {
          alert("Select any value of interview stage");
        } else {
          alert("something went wrong , refresh page and try again");
        }
      })
      .catch((e) => {
        console.log("e at here", e);
        alert("Something went wrong");
      });
  };

  const fetchJobList = async () => {
    // axios POST request
    const options = {
      url: "http://localhost:3003/job/get-jobs",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      data: { id: localStorage.getItem("organization_id") },
    };

    axios(options).then((response) => {
      // console.log(response);

      setData(response.data.jobs);
    });
  };

  // console.log(data);
  return (
    <div className="flex flex-wrap gap-6">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {data?.map((e, index) => {
        console.log("e value id", e);
        return (
          <div
            key={index}
            title="Job"
            className="bg-white hover:bg-gray-100  hover:border hover:border-solid hover:border-gray-300 flex flex-wrap  items-center w-80 pl-4 pr-4 pt-2 modalShadow cursor-pointer "
          >
            {/* <Link to={"/JobDetails"}> */}
            <div className=" w-full p-2 flex justify-between items-center ">
              <h2
                className="heading3 inline font-medium"
                onClick={(event) => handleJob(e._id)}
              >
                {e.jobPosition}
              </h2>
              <button
                className={`inline float-right mr-4 p-2 w-20 rounded-full font-medium text-primarytext  border-2 border-solid
               border-secondry ${
                 e.job_status === "Active" ? "bg-primary" : "bg-red-500"
               } text-white hover:text-white`}
                onClick={() => {
                  handleJobStatus(e._id, e.job_status);
                }}
              >
                {e.job_status}
              </button>
            </div>

            {/* PART TO HANDLE DATA */}
            <div
              className="w-full flex h-28"
              onClick={(event) => handleJob(e._id)}
            >
              <div className="w-1/2 flex flex-col justify-center text-center">
                <div className="heading4">Totall Candidates</div>
                <div className="heading4 font-medium">{e.applicants_no}</div>
              </div>

              <div className="w-1/2  flex flex-col justify-center text-center">
                <div className="heading4  ">Active Candidates</div>
                <div className="heading4 font-medium">0</div>
              </div>
            </div>

            {/* PART TO SHOW SHARE JOB-ID AND SHARE BUTTONS */}

            <div className="flex flex-row w-full pb-4">
              <div className=" w-4/5 ml-4">
                <p className="text-sm heading4">JOB-ID: {index}</p>
              </div>

              <div className="flex justify-around items-center w-1/4">
                <img src={DeleteIcon} alt="" className="inline w-4 h-4" />
                <img src={SocialIcon} alt="" className="inline w-4 h-4" />
              </div>
            </div>
            {/* </Link> */}
          </div>
        );
      })}
    </div>
  );
}

export default CreatedJobElement;
