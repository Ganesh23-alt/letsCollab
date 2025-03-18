import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();

  function createProject(e) {
    e.preventDefault();
    axios
      .post("/projects/create", { name: projectName })
      .then((res) => {
        setProjects([...projects, res.data.project]);
        setIsModalOpen(false);
        setProjectName("");
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => setProjects(res.data.projects))
      .catch((err) => console.log(err));
  }, []);

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <button
          className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="ri-add-line text-4xl text-blue-600 mb-2"></i>
          <span className="text-gray-700">New Project</span>
        </button>

        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => navigate(`/project`, { state: { project } })}
            className="cursor-pointer p-6 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition"
          >
            <img
              src="https://via.placeholder.com/150"
              alt="Project Thumbnail"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="font-semibold text-lg text-gray-800">{project.name}</h2>
            <p className="text-gray-600 text-sm flex items-center mt-2">
              <i className="ri-user-line mr-1"></i> Collaborators: {project.users.length}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Create New Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
