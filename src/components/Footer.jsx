import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import FolderIcon from "@mui/icons-material/Folder";
import RestoreIcon from "@mui/icons-material/Restore";

import { useState } from "react";
import {
  AccountBalance,
  AccountCircle,
  AddCard,
  AddIcCall,
  Favorite,
  LocationOn,
  RestartAlt,
} from "@mui/icons-material";
import { Paper } from "@mui/material";

function Footer() {
  const [value, setValue] = useState("");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
        left: 0,
      }}
    >
      <BottomNavigation
        sx={{ justifyContent: "space-between" }}
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction
          label="Balance"
          value="balance"
          icon={<AccountBalance />}
        />
        <BottomNavigationAction
          label="Account"
          value="account"
          icon={<AccountCircle />}
        />
        <BottomNavigationAction
          label="Card"
          value="addCard"
          icon={<AddCard />}
        />
        <BottomNavigationAction
          label="Location"
          value="location"
          icon={<LocationOn />}
        />
        <BottomNavigationAction
          label="Call"
          value="call"
          icon={<AddIcCall />}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default Footer;
