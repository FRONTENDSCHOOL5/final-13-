import React, { useState, useEffect } from 'react';
import imageValidation from '../../../util/validation/imageValidation';
import {
  ProfileEditWrap,
  ImageWrapper,
  DefaultProfileImg,
  ProfileUploadInput,
  ProfileUploadLabel,
  ProfileUploadDiv,
  TextInputBox,
  ErrorMessage,
} from './ProfileEdit.styled';
import TextActiveInput from '../../../components/common/TextActiveInput/TextActiveInput';
import TopUploadNav from '../../../components/common/Top/TopUploadNav';
import uploadImage from '../../../assets/img/upload-file.svg';

import { useRecoilValue } from 'recoil';
import { recoilData } from '../../../recoil/atoms/dataState';
import {
  useGetProfile,
  useUpdateProfile,
  useUploadProfileImage,
} from '../../../hooks/react-query/useProfile';

export default function ProfileEdit() {
  const [profileImage, setProfileImage] = useState('');
  const [userName, setUserName] = useState('');
  const [isUserNameInvalid, setIsUserNameInvalid] = useState(false);
  const [userIdErrorMessage, setUserIdErrorMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isUserIdInvalid, setIsUserIdInvalid] = useState(false);
  const [description, setDescription] = useState('');
  const [isDescriptionInvalid, setIsDescriptionInvalid] = useState(false);
  const idRegExp = /^[a-zA-Z0-9_.]+$/;

  const currentUserData = useRecoilValue(recoilData);
  const myAccountName = currentUserData.accountname;

  const { profile } = useGetProfile(myAccountName);
  const { updateProfileMutate } = useUpdateProfile();
  const { uploadProfileImageMutate, uploadedImage } = useUploadProfileImage();

  useEffect(() => {
    setProfileImage(profile.image);
    setUserName(profile.username);
    setUserId(profile.accountname);
    setDescription(profile.intro);
  }, []);

  useEffect(() => {
    if (uploadedImage) {
      console.log(uploadedImage);
      setProfileImage(uploadedImage);
    }
  }, [uploadedImage]);

  const handleUserNameChange = (e) => {
    const currentUserName = e.target.value;
    setUserName(currentUserName);
  };

  const handleUserIdChange = (e) => {
    const currentUserId = e.target.value.trim();
    setUserId(currentUserId);
  };

  const handleDescriptionChange = (e) => {
    const currentDescription = e.target.value;
    setDescription(currentDescription);
  };

  // focus를 잃으면 실행
  const handleUserNameBlur = () => {
    // 유효성 검사
    // 사용자 이름 : 2~10자 이내여야합니다.
    if (userName.length < 2 || userName.length > 10) {
      setIsUserNameInvalid(true);
      console.log(isUserNameInvalid);
    } else {
      setIsUserNameInvalid(false);
      console.log(isUserNameInvalid);
    }
  };

  // focus를 잃으면 실행
  const handleUserIdBlur = () => {
    // 유효성 검사
    // 계정ID: 영문, 숫자, 특수문자(.), (_)만 사용가능합니다.
    if (!idRegExp.test(userId)) {
      setIsUserIdInvalid(true);
      setUserIdErrorMessage(
        '*계정ID는 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.',
      );
      console.log(isUserIdInvalid);
    } else {
      setIsUserIdInvalid(false);
      console.log(isUserIdInvalid);
    }
  };

  // focus를 잃으면 실행
  const handleDescriptionBlur = () => {
    // 유효성 검사
    // 소개: 글이 비어있지 않으면 유효성검사 통과
    if (!description) {
      setIsDescriptionInvalid(true);
      console.log(isDescriptionInvalid);
    } else {
      setIsDescriptionInvalid(false);
      console.log(isDescriptionInvalid);
    }
  };

  async function handleClick() {
    try {
      const user = JSON.stringify({
        user: {
          username: userName,
          accountname: userId,
          intro: description,
          image: profileImage,
        },
      });

      console.log('user', user);

      updateProfileMutate(user);
    } catch (error) {
      console.error(error);

      setIsUserIdInvalid(true);
      setUserIdErrorMessage(`*${error.response.data.message}`);
    }
  }

  const handleImageUploadChange = async (e) => {
    console.log(e.target.files[0]);
    const selectedImage = e.target.files[0];

    if (!selectedImage) {
      console.log('선택이미지없음');
      return;
    }
    if (!imageValidation(selectedImage)) {
      console.log('validation안됨');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    uploadProfileImageMutate(formData);
  };

  return (
    <>
      <TopUploadNav
        onClick={handleClick}
        disabled={isUserIdInvalid || isUserNameInvalid || isDescriptionInvalid}
      />
      <ProfileEditWrap>
        <TextInputBox>
          <ImageWrapper>
            <DefaultProfileImg
              src={profileImage}
              // src={profileImage ? profileImage : profileDefault}
            />
            <ProfileUploadLabel htmlFor="upload-button">
              <ProfileUploadDiv>
                <img src={uploadImage} />
              </ProfileUploadDiv>
            </ProfileUploadLabel>
            <ProfileUploadInput
              type="file"
              className="user-profile"
              id="upload-button"
              onChange={handleImageUploadChange}
            />
          </ImageWrapper>
          <TextActiveInput
            type="text"
            className="user-name"
            // placeholder="2~10자 이내여야 합니다."
            value={userName}
            onChange={handleUserNameChange}
            onBlur={handleUserNameBlur}
          >
            사용자 이름
          </TextActiveInput>
          {/* {isUserNameInvalid && (
          <ErrorMessage>*사용자 이름은 2~10자 이내여야 합니다.</ErrorMessage>
        )} */}
          <TextActiveInput
            type="text"
            className="user-id"
            // placeholder="영문, 숫자, 특수문자(.),(_)만 사용 가능합니다."
            value={userId}
            onChange={handleUserIdChange}
            onBlur={handleUserIdBlur}
          >
            계정ID
          </TextActiveInput>
          {isUserIdInvalid && <ErrorMessage>{userIdErrorMessage}</ErrorMessage>}
          <TextActiveInput
            type="text"
            className="user-description"
            // placeholder="자신과 판매할 상품에 대해 소개해주세요!"
            value={description}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
          >
            소개
          </TextActiveInput>
          {/* {isDescriptionInvalid && (
          <ErrorMessage>*내용을 입력해주세요</ErrorMessage>
        )} */}
        </TextInputBox>
      </ProfileEditWrap>
    </>
  );
}
