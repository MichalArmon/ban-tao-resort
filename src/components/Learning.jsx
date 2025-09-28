import styled from "@emotion/styled";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import theme from "../theme";

const MySpecialBox = (props) => {
  return (
    <Box>
      label:{props.label}
      {props.children}
    </Box>
  );
};
const MyStyledButton = styled(Button)({
  color: "red",
  backgroundColor: "blue",
  padding: 8,
  borderRadius: 10,
});
function Learning() {
  const [activated, setActivated] = useState(false);
  return (
    <MySpecialBox label="Special Box">
      <Button
        onClick={() => setActivated(!activated)}
        sx={{
          color: "red",
          bgcolor: activated ? "#fff" : "#000",
          fontSize: "h1.fontSize",
          boxShadow: (theme) =>
            `${theme.shadows[4]}, 0 0 10px ${theme.palette.primary.main}`,
        }}
        variant="contained"
      >
        My Box
      </Button>
      <MyStyledButton>Im styled</MyStyledButton>
    </MySpecialBox>
  );
}

export default Learning;
