import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    useDisclosure,
    Button,
    Input
} from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/form-control';
import { ChatState } from '../../context/ChatProvider';
import axios from 'axios';
import UserListItem from '../userAvatar/userListItem';
import UserBadgeItem from '../userAvatar/UserBadgeItem';

const GroupChatModal = ({ children }) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const { user, chats, setChats } = ChatState();


    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            })
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            console.log('data', data);
            setLoading(false);
            setSearchResult(data);
        }
        catch (err) {
            toast({
                title: "Error Occured!",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            })
        }
    }

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            })
            return;
        }

        try {

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.post("/api/chat/group", {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            }, config);

            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            })


        } catch (error) {
            toast({
                title: "Failed to Create the Chat!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }

    }

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return;
        }
        else
            setSelectedUsers([...selectedUsers, userToAdd]);
    }

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== delUser._id));
    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={"35px"}
                        fontFamily={"Work sans"}
                        display={"flex"}
                        justifyContent={"center"}
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
                        <FormControl>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            ></Input>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add Users eg: John, Piyush, Jane"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            ></Input>
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {
                                selectedUsers.map(u => (
                                    <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                                ))
                            }
                        </Box>
                        {
                            loading ? (<div>loading...</div>) : (
                                searchResult && searchResult.length > 0 ? (
                                    searchResult.slice(0, 4).map(searchUser => <UserListItem key={searchUser._id} user={searchUser} handleFunction={() => handleGroup(searchUser)} />)
                                ) : (
                                    <div></div>
                                )
                            )

                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                            Create Chat
                        </Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal