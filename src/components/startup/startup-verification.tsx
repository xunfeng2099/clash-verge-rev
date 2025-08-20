import React, { useState, useEffect, useCallback } from "react";
  import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
  } from "@mui/material";
  import { useTranslation } from "react-i18next";
  import { exit } from "@tauri-apps/plugin-process";

  interface StartupVerificationProps {
    open: boolean;
    onVerificationComplete: () => void;
  }

  const REQUIRED_TEXT = "我承诺不进行非法内容浏览,如果我当前有这样想法就立刻退出";

  export const StartupVerification: React.FC<StartupVerificationProps> = ({
    open,
    onVerificationComplete,
  }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState("");
    const [error, setError] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // 防止复制粘贴的处理函数
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // 禁用 Ctrl+V, Cmd+V, Ctrl+A, Cmd+A
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "v" || e.key === "V" || e.key === "a" || e.key === "A")
      ) {
        e.preventDefault();
        setError("禁止使用复制粘贴和全选功能，请手动输入");
        return;
      }

      setIsTyping(true);
      setError("");
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setError("禁止使用右键菜单，请手动输入");
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputText(value);

   

      setIsTyping(false);

      if (error) {
        setError("");
      }
    }, [isTyping, error]);

    const handleVerify = useCallback(async () => {
      if (inputText.trim() === REQUIRED_TEXT) {
        onVerificationComplete();
      } else {
        setError("输入的文本不正确，请仔细检查后重新输入");
      }
    }, [inputText, onVerificationComplete]);

    const handleExit = useCallback(async () => {
      try {
        await exit(0);
      } catch (error) {
        console.error("退出应用失败:", error);
        window.close();
      }
    }, []);

    return (
      <Dialog
        open={open}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
            启动验证
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              为了确保应用的合法使用，请在下方输入框中手动输入以下文本：
            </Typography>

            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.300",
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  userSelect: "none",
                }}
              >
                {REQUIRED_TEXT}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              注意：禁止复制粘贴，必须手动输入每个字符
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="请在此处手动输入上述文本..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            autoComplete="off"
            spellCheck={false}
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
              },
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleExit}
            color="secondary"
            variant="outlined"
          >
            退出应用
          </Button>
          <Button
            onClick={handleVerify}
            color="primary"
            variant="contained"
            disabled={!inputText.trim()}
          >
            验证并继续
          </Button>
        </DialogActions>
      </Dialog>
    );
  };