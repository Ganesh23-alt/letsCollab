import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";

const Project = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false); // Track if the modal for added users is open
  const [isUserListOpen, setIsUserListOpen] = useState(false); // Track if the add user options are open
  const [addedUsers, setAddedUsers] = useState([]);
  const [collaborators, setCollaborators] = useState([]); // List of added users (collaborators)
  const [allUsers, setAllUsers] = useState([]); // All available users to add
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // State variable for messages
  const [project, setProject] = useState(location.state.project);
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);

  const getUsernameById = (userId) => {
    const user = allUsers.find((user) => user._id === userId);
    return user ? user.name : "Unknown User";
  };

  // Function to handle adding a user to the collaboration
  const addCollaborator = (userId) => {
    if (addedUsers.includes(userId)) {
      alert("This user is already added!");
      return;
    }
    axios
      .put("projects/add-user/", {
        projectId: location.state.project._id,
        users: [userId],
      })
      .then((res) => {
        setAddedUsers((prev) => [...prev, userId]); // Add the user to the list of added users
        const newCollaborator = allUsers.find((user) => user._id === userId);
        setCollaborators((prev) => [...prev, newCollaborator]); // Add the user to the list of collaborators
        // console.log("Collaborator added:", res.data);
      })
      .catch((err) => {
        console.log("Error adding collaborator:", err);
      });
  };

  // Function to handle removing a collaborator
  const removeCollaborator = (userId) => {
    axios
      .put("projects/remove-user/", {
        projectId: location.state.project._id,
        userId: userId, // Ensure userId is included in the request
      })
      .then((res) => {
        setAddedUsers(addedUsers.filter((id) => id !== userId)); // Remove the user from the list of added users
        setCollaborators(
          collaborators.filter((collaborator) => collaborator._id !== userId)
        ); // Update the collaborators list
        console.log("Collaborator removed:", userId);
      })
      .catch((err) => {
        console.log(
          "Error removing collaborator:",
          err.response?.data || err.message
        );
        alert("Failed to remove collaborator. Please try again.");
      });
  };

  function send() {
    if (message.trim() === "") return;

    console.log("working", message);
    sendMessage("project-message", {
      message,
      sender: user._id,
      username: user.name,
    });

    appendIncomingMessage({
      message,
      sender: user,
      username: user.name,
    });

    setMessage("");
  }

  // Fetch added users (collaborators) when the component mounts
  useEffect(() => {
    const socket = initializeSocket(project._id);

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
    });

    socket.on("disconnect", () => {
      console.warn("WebSocket disconnected. Attempting to reconnect...");
      setTimeout(() => {
        socket.connect();
      }, 3000); // Attempt to reconnect after 3 seconds
    });

    receiveMessage("project-message", (data) => {
      console.log("Received message:", data);
      appendIncomingMessage(data);
    });

    axios
      .get(`projects/get-project/${project._id}/collaborators`)
      .then((res) => {
        setCollaborators(res.data.collaborators);
        setAddedUsers(
          res.data.collaborators.map((collaborator) => collaborator._id)
        );
        // console.log("Fetched collaborators:", res.data.collaborators);
      })
      .catch((err) => {
        console.log("Error fetching collaborators:", err);
      });

    // Fetch all users to choose from when adding a collaborator
    axios
      .get("/users/all")
      .then((res) => {
        setAllUsers(res.data.users || []);
        // console.log("Fetched all users:", res.data.users);
      })
      .catch((err) => {
        console.log("Error fetching users:", err);
      });

    return () => {
      socket.disconnect();
    };
  }, [project._id]);

  function appendIncomingMessage(messageObject) {
    setMessages((prevMessages) => [...prevMessages, messageObject]);
    const messageBoxElement = messageBox.current;
    messageBoxElement.scrollTop = messageBoxElement.scrollHeight;
  }

  return (
    <main className="h-screen w-screen flex bg-gray-100 relative">
      {/* Left Sidebar */}
      <section className="left relative flex flex-col h-screen w-96 bg-white shadow-lg border-r border-gray-200 p-4">
        <header className="flex justify-between items-center p-4 w-full bg-gray-100 shadow-md rounded-lg">
          <button
            className="flex gap-2 text-gray-700 hover:text-gray-900 transition-all"
            onClick={() => setIsModalOpen(true)} // Open the modal when clicked
          >
            <i className="ri-group-fill text-xl"></i> View Collaborators
          </button>
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            onClick={() => setIsUserListOpen(true)} // Open the add user options
          >
            Add Collaborator
          </button>
        </header>

        {/* Conversation Area */}
        <div className="conversation-area flex-grow flex flex-col relative p-4 overflow-hidden bg-gray-50 rounded-lg shadow-inner">
          <div
            ref={messageBox}
            className="message-box flex-grow flex flex-col gap-3 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 p-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message max-w-60 rounded-lg p-3 mb-2 ${
                  msg.sender === user._id
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <small className="text-xs">{msg.username}</small>
                <p className="text-sm">
                  {msg.sender._id === "AI" ? (
                    <Markdown>{msg.message}</Markdown>
                  ) : (
                    msg.message
                  )}
                </p>
              </div>
            ))}
          </div>
          {/* Input Field */}
          <div className="inputField w-full flex items-center bg-white p-2 rounded-lg mt-2 border border-gray-300 shadow-sm">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-2 border-none outline-none bg-transparent text-gray-700 placeholder-gray-500"
              type="text"
              placeholder="Enter message"
            />
            <button
              onClick={send}
              className="p-2 text-blue-500 hover:text-blue-700 transition-all"
            >
              <i className="ri-send-plane-fill text-xl"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Added Users */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-all duration-300 ease-in-out ${
          isModalOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="w-96 max-h-full bg-white shadow-lg relative p-6 flex flex-col rounded-lg">
          <button
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-2xl"
            onClick={() => setIsModalOpen(false)} // Close the modal when clicked
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">Added Collaborators</h2>
          <div className="users flex flex-col gap-4 overflow-auto">
            {collaborators.length === 0 ? (
              <p className="text-gray-500">No collaborators added yet.</p>
            ) : (
              collaborators.map((collaborator) => {
                const user = allUsers.find((u) => u._id === collaborator._id);
                return (
                  <div
                    key={collaborator._id}
                    className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg shadow-sm"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white text-lg">
                      <i className="ri-user-fill"></i>
                    </div>
                    <div className="flex flex-col">
                      <small className="text-gray-500">
                        {collaborator.email}
                      </small>
                    </div>
                    <button
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      onClick={() => removeCollaborator(collaborator._id)} // Remove collaborator
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Collaborator Panel */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-all duration-300 ease-in-out ${
          isUserListOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="w-96 bg-white shadow-lg relative p-6 flex flex-col rounded-lg">
          <button
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-2xl"
            onClick={() => setIsUserListOpen(false)} // Close the add collaborator panel
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">Add Collaborator</h2>
          <div className="users flex flex-col gap-4 overflow-auto">
            {allUsers.length === 0 ? (
              <p className="text-gray-500">No users available to add.</p>
            ) : (
              allUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg shadow-sm"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white text-lg">
                    <i className="ri-user-add-fill"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {user.name}
                    </span>
                    <small className="text-gray-500">{user.email}</small>
                  </div>
                  {addedUsers.includes(user._id) ? (
                    <span className="p-2 bg-gray-500 text-white rounded-lg">
                      Added
                    </span>
                  ) : (
                    <button
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                      onClick={() => addCollaborator(user._id)} // Add collaborator
                    >
                      Add
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Project;
