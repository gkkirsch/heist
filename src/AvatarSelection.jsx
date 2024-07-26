import React from 'react';
import { avatars } from "./avatars"

const AvatarSelection = ({ borderWidth = 4, size = "100", avatar, index, selectedAvatar, setSelectedAvatar }) => {
  return (
    <svg
      width={size}
      height={size}
      onClick={() => setSelectedAvatar(avatar)}
      style={{ cursor: 'pointer' }}
    >
      <defs>
        <clipPath id={`avatarClip${index}`}>
          <circle cx={size / 2} cy={size / 2} r={(size - borderWidth) / 2} />
        </clipPath>
      </defs>

      {/* Avatar image */}
      <image
        href={avatars[avatar]}
        width={size}
        height={size}
        clipPath={`url(#avatarClip${index})`}
      />

      {/* Border circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size - borderWidth) / 2}
        stroke={selectedAvatar === avatar ? 'white' : 'black'}
        strokeWidth={borderWidth}
        fill="none"
      />
    </svg>
  );
};

export default AvatarSelection;
