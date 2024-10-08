import React from "react";
import { FiSend } from "react-icons/fi";
import { useParams } from "react-router-dom";
import TopRcruitementCycle from "../../Components/Dashboard/CreateJob/TopRcruitementCycle";
import LeftMenuBar from "../../Components/Dashboard/LeftMenuBar";
import TopNavigationBar from "../../Components/Dashboard/TopNavigationBar";
import HiredCandidateCard from "../../Components/RecruitmentStage/HiredCandidateCard";
import ReccomendidCandidateCard from "../../Components/RecruitmentStage/ReccomendidCandidateCard";

function HiredCandidates() {
  const { id } = useParams();
  console.log("id", id);

  return (
    <div>
      <div className="flex bg-white ">
        <div className="hidden sm:block w-2/12 bg-white h-screen ">
          <LeftMenuBar />
        </div>
        <div className="w-screen bg-background ">
          <div className="p-0 w-full">
            <TopNavigationBar title={"Hired"} className="w-full" />
            <TopRcruitementCycle id={id} />
          </div>
          <div className="w-11/12 m-auto mt-12  ">
            <h2 className="heading3">Hired Candidates List</h2>
            <div className="mt-6">
              <HiredCandidateCard id={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HiredCandidates;
