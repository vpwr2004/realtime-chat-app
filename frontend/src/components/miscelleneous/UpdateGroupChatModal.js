import { IconButton, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Box,
    Input,
    FormControl
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from '../../context/ChatProvider';
import { useToast } from '@chakra-ui/react';
import UserBadgeItem from '../userAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../userAvatar/userListItem';


const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { selectedChat, setSelectedChat, user } = ChatState();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const toast = useToast();



    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put('api/chat/rename', {
                chatId: selectedChat._id,
                chatName: groupChatName,
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
        return;
    }

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
            });
        }
    }

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admin can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = axios.put('/api/chat/groupremove', {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (err) {
            toast({
                title: "Error Occured!",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User already in group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            })
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admin can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = axios.put('/api/chat/groupadd', {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);

        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.datra.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }
    }

    return (
        <>
            <IconButton display={"flex"} icon={<ViewIcon />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={"35px"}
                        fontFamily={"Work sans"}
                        display={"flex"}
                        justifyContent={"center"}
                    >{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w={"100%"} display={"flex"} flexWrap={"wrap"} pb={3}>
                            {
                                selectedChat.users.map(u => (
                                    <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)} />
                                ))
                            }
                        </Box>
                        <FormControl display={"flex"}>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            ></Input>

                            <Button
                                variant="solid"
                                colorScheme='teal'
                                mb={1}
                                isLoading={renameLoading}
                                onClick={handleRename}
                            >Update</Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            ></Input>
                        </FormControl>
                        {
                            loading ? (<div>loading...</div>) : (
                                searchResult && searchResult.length > 0 ? (
                                    searchResult.slice(0, 4).map(searchUser => <UserListItem key={searchUser._id} user={searchUser} handleFunction={() => handleAddUser(searchUser)} />)
                                ) : (
                                    < ></>
                                )
                            )

                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' onClick={() => handleRemove(user)}>
                            Leave Group
                        </Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal