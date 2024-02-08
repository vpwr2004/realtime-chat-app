import React, { useState } from 'react'
import { Box, Text } from '@chakra-ui/layout';
import { Tooltip, useDisclosure, Input, useToast, Spinner } from '@chakra-ui/react';
import { Button } from '@chakra-ui/button';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
} from "@chakra-ui/menu";
import { Avatar } from '@chakra-ui/avatar';
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/modal";
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import ChatLoading from '../ChatLoading';
import axios from 'axios';
import UserListItem from '../userAvatar/userListItem';
import { getSender } from '../config/ChatLogics';
import { Effect } from 'react-notification-badge';
import NotificationBadge from 'react-notification-badge';

const SideDrawer = () => {

    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const navigate = useNavigate();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate('/');
    }

    const handleSearch = async () => {
        if (!search) {
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
                },
            };

            // console.log('searc', user);

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        }
        catch (err) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            })
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post("/api/chat", { userId }, config);

            if (!chats.find(c => c._id === data._id)) setChats([data, ...chats]);

            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
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

    return (

        <>
            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} bg={"white"} w={"100%"} p={"5px 10px 5px 10px"} borderWidth={"5px"}>
                <Tooltip
                    label="Serch User to chat"
                    hasArrow
                    placement="bottom-end"
                >
                    <Button variant={"ghost"} onClick={onOpen}>
                        <i className='fas fa-search'></i>
                        <Text d={{ base: "none", md: "flex" }} px="4px">Serch User</Text>
                    </Button>
                </Tooltip>
                <Text fontSize={"2xl"} fontFamily={"Work sans"}>
                    Snappy Chat App
                </Text>

                <div>
                    {/* <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize={"2xl"} m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem key={notif._id} onClick={() => {
                                    setSelectedChat(notif.chat);
                                    setNotification(notification.filter((n) => n !== notif));

                                }}>
                                    {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu> */}
                    <Menu>
                        <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>

                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>

                    <DrawerBody>
                        <Box display={"flex"} pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {
                            loading ? (<ChatLoading />) : (
                                searchResult?.map(searchUser => (
                                    <UserListItem
                                        key={searchUser._id}
                                        user={searchUser}
                                        handleFunction={() => accessChat(searchUser._id)}
                                    // onClick={() => accessChat(user._id)}
                                    />
                                ))
                            )
                        }
                        {loadingChat && <Spinner ml="auto" d="flex" />}
                    </DrawerBody>






                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer;