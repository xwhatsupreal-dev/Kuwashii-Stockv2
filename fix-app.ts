import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `            sendDiscordTopupEmbed(
              activeUsername,
              amount,
              "angpao",
              newBalance,
              true,
              appScreen
            );
          } else {
            let errorMsg =
              data.message || "ซองของขวัญไม่ถูกต้องหรือถูกใช้งานไปแล้ว";
            if (errorMsg.includes("ติดต่อผู้ดูแลระบบ")) {
              errorMsg += " ";
            }
            if (errorMsg.includes("http")) {
              errorMsg = errorMsg.replace(
                /https:\\/\\/discord\\.gg\\/[a-zA-Z0-9]+/g,
                "https://discord.gg/AQKtJpvyva",
              );
            }
            setTopupError(\`API แจ้งเตือน: \${errorMsg}\`);
            showToast(errorMsg, "error");
            sendDiscordTopupEmbed(
              activeUsername,
              0,
              "angpao",
              (liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0),
              false,
              appScreen
            );
          }
        } catch (error: any) {
          console.error("Topup error:", error);
          const catchErr = "ระบบเครือข่ายมีปัญหา หรือเรียกใช้ API ไม่ได้";
          setTopupError(catchErr);
          showToast(catchErr, "error");
        } finally {
          setIsProcessingTopup(false);
        }
      };
      receiveAngpao();
      return;
    }

    if (topupModalStep === "bank") {
      if (!slipFile) {
        showToast("กรุณาแนบสลิปการโอนเงิน", "error");
        setIsProcessingTopup(false);
        return;
      }

      const processBankSlip = async () => {
        try {
          setTopupError("");
          const checkRes = await fetch("/api/easyslip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload: slipPayload,
            }),
          });
          const data = await checkRes.json();
          if (data.status === 200 && data.data) {
            const amount = parseFloat(data.data.amount.amount) || 0;
            const receiverName = data.data.receiver.name || "ไม่ทราบชื่อ";
            const senderName = data.data.sender.name || "ไม่ทราบชื่อ";
            const transRef = data.data.transRef;

            const { data: existingTopup } = await supabase
              .from("topups")
              .select("id")
              .eq("method", \`Slip: \${transRef}\`)
              .single();

            if (existingTopup) {
              const errMsg = "สลิปนี้ถูกใช้งานไปแล้ว";
              setTopupError(errMsg);
              showToast(errMsg, "error");
              setIsProcessingTopup(false);
              sendDiscordTopupEmbed(
                activeUsername,
                0,
                "bank",
                (liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0),
                false,
                appScreen
              );
              return;
            }

            const configData = await getSystemConfig();
            if (appScreen === "ASTD") {
              const currentRev = configData
                ? Number(configData.global_rev_astd || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({ id: "main", global_rev_astd: currentRev + amount });
            } else {
              const currentRev = configData
                ? Number(configData.global_revenue_aotr || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({
                  id: "main",
                  global_revenue_aotr: currentRev + amount,
                });
            }

            const balanceField = appScreen === "ROV" ? "balance_rov" : "balance";
            const userBalance = Number(liveUser[balanceField] || 0);
            const newBalance = userBalance + amount;
            await supabase
              .from("profiles")
              .update({ [balanceField]: newBalance })
              .eq("username", activeUsername);

            const { error: topupError } = await supabase.from("topups").insert([
              {
                username: activeUsername,
                amount: amount,
                method: \`Slip: \${transRef}\`,
                game: appScreen,
              },
            ]);
            if (topupError) {
              await supabase.from("topups").insert([
                {
                  username: activeUsername,
                  amount: amount,
                  method: \`Slip: \${transRef}\`,
                },
              ]);
            }

            window.dispatchEvent(new Event("sync-update"));

            const bankMsg = \`เติมเงินด้วยสลิปสำเร็จ! จำนวน \${amount.toLocaleString()} บาท\\nจาก: \${senderName}\\nถึง: \${receiverName}\`;
            showToast(bankMsg, "success");
            setTopupSuccessMessage(bankMsg);
            setTopupModalStep("success");
            setSlipFile(null);
            if (currentUser) setCurrentUser({ ...currentUser });
            sendDiscordTopupEmbed(
              activeUsername,
              amount,
              "bank",
              newBalance,
              true,
              appScreen
            );
          } else {
            let finalErr = data.message || "ข้อมูลสลิปไม่ถูกต้อง หรือเช็คไม่ได้";
            if (finalErr.includes("ติดต่อผู้ดูแลระบบ")) {
              finalErr += " ";
            }
            if (finalErr.includes("http")) {
              finalErr = finalErr.replace(
                /https:\\/\\/discord\\.gg\\/[a-zA-Z0-9]+/g,
                "https://discord.gg/AQKtJpvyva"
              );
            }
            setTopupError(\`API แจ้งเตือน: \${finalErr}\`);
            showToast(finalErr, "error");
            sendDiscordTopupEmbed(
              activeUsername,
              0,
              "bank",
              (liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0),
              false,
              appScreen
            );
          }
        } catch (error: any) {
          console.error("Bank check error:", error);
          const catchErr = "ระบบเครือข่ายมีปัญหา หรือเรียกใช้ API ไม่ได้";
          setTopupError(catchErr);
          showToast(catchErr, "error");
        } finally {
          setIsProcessingTopup(false);
        }
      };
      processBankSlip();
      return;
    }`;

const badStart = `            sendDiscordTopupEmbed(
              activeUsername,
              0,
              "bank",
              (liveUser[appScreen === "ROV" ? "balance_rov" : "balance"] || 0),
              false,
              appScreen
            );
          }
        } catch (error: any) {
          console.error("Bank check error:", error);
          const catchErr = "ระบบเครือข่ายมีปัญหา หรือเรียกใช้ API ไม่ได้";
          setTopupError(catchErr);
          showToast(catchErr, "error");
        } finally {
          setIsProcessingTopup(false);
        }
      };
      processBankSlip();
      return;
    }`;

content = content.replace(badStart, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('Restored Topup Modal logic');
