import React, { useState } from "react";
import { VStack } from "@chakra-ui/layout";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    // const history = useHistory();

    const handleClick = () => {
        setShow(!show);
    };


    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please fill all Fields!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login", { email, password }, config
            );

            toast({
                title: "Login Successfully!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            localStorage.setItem("userInfo", JSON.stringify(data));
            // history.push('/chats');
            navigate('/chats');
        }
        catch (err) {
            toast({
                title: "Error Occured!",
                description: err.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }


    }
    return (
        <VStack>


            <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>

            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        value={password}
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width={"4.5rem"}>
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>



            <Button
                colorScheme="blue"
                width={'100%'}
                style={{ marginTop: 15 }}
                onClick={submitHandler}
            >
                Login
            </Button>

            <Button
                variation='solid'
                colorScheme='red'
                width='100%'
                isLoading={loading}
                onClick={() => {
                    setEmail("guest@gmail.com");
                    setPassword("123456");
                }}
            >
                Get Guest User Credentials
            </Button>
        </VStack>
    );
};

export default Login;
